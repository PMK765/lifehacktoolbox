export type TrackId = "kick" | "snare" | "hihat" | "bass";

export type DrumMachineAudioContext = {
  audioContext: AudioContext;
  masterGain: GainNode;
  noiseBuffer: AudioBuffer;
};

export type ScheduledStepEvent = {
  stepIndex: number;
  time: number;
};

const createNoiseBuffer = (
  audioContext: AudioContext
): AudioBuffer => {
  const length = audioContext.sampleRate * 1.5;
  const buffer = audioContext.createBuffer(
    1,
    length,
    audioContext.sampleRate
  );
  const data = buffer.getChannelData(0);
  const samples = data.length;
  for (let index = 0; index < samples; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  return buffer;
};

export const createDrumMachineAudioContext = (): DrumMachineAudioContext | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const AnyWindow = window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioCtor =
    window.AudioContext ?? AnyWindow.webkitAudioContext;
  if (!AudioCtor) {
    return null;
  }
  const audioContext = new AudioCtor();
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(audioContext.destination);
  const noiseBuffer = createNoiseBuffer(audioContext);
  return { audioContext, masterGain, noiseBuffer };
};

export const setMasterVolume = (
  ctx: DrumMachineAudioContext,
  volume: number
): void => {
  const clamped =
    volume < 0 ? 0 : volume > 1 ? 1 : volume;
  ctx.masterGain.gain.value = clamped;
};

const triggerKick = (
  ctx: DrumMachineAudioContext,
  time: number
): void => {
  const osc = ctx.audioContext.createOscillator();
  const gain = ctx.audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(
    45,
    time + 0.18
  );
  gain.gain.setValueAtTime(0.9, time);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    time + 0.22
  );
  osc.connect(gain);
  gain.connect(ctx.masterGain);
  osc.start(time);
  osc.stop(time + 0.3);
};

const triggerSnare = (
  ctx: DrumMachineAudioContext,
  time: number
): void => {
  const noiseSource =
    ctx.audioContext.createBufferSource();
  noiseSource.buffer = ctx.noiseBuffer;
  const noiseFilter =
    ctx.audioContext.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1800;
  noiseFilter.Q.value = 0.8;
  const noiseGain = ctx.audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.8, time);
  noiseGain.gain.exponentialRampToValueAtTime(
    0.001,
    time + 0.18
  );
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.masterGain);
  noiseSource.start(time);
  noiseSource.stop(time + 0.25);
};

const triggerHiHat = (
  ctx: DrumMachineAudioContext,
  time: number
): void => {
  const noiseSource =
    ctx.audioContext.createBufferSource();
  noiseSource.buffer = ctx.noiseBuffer;
  const highpass =
    ctx.audioContext.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 7000;
  const gain = ctx.audioContext.createGain();
  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    time + 0.08
  );
  noiseSource.connect(highpass);
  highpass.connect(gain);
  gain.connect(ctx.masterGain);
  noiseSource.start(time);
  noiseSource.stop(time + 0.12);
};

const triggerBass = (
  ctx: DrumMachineAudioContext,
  time: number
): void => {
  const osc = ctx.audioContext.createOscillator();
  const filter =
    ctx.audioContext.createBiquadFilter();
  const gain = ctx.audioContext.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(60, time);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(380, time);
  gain.gain.setValueAtTime(0.7, time);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    time + 0.28
  );
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.masterGain);
  osc.start(time);
  osc.stop(time + 0.32);
};

export const triggerTrackSound = (
  ctx: DrumMachineAudioContext,
  trackId: TrackId,
  time: number
): void => {
  if (trackId === "kick") {
    triggerKick(ctx, time);
  } else if (trackId === "snare") {
    triggerSnare(ctx, time);
  } else if (trackId === "hihat") {
    triggerHiHat(ctx, time);
  } else {
    triggerBass(ctx, time);
  }
};

export const scheduleStepSequence = (
  bpm: number,
  startTime: number,
  fromStep: number,
  swingPercent: number
): ScheduledStepEvent[] => {
  const cleanBpm = bpm > 0 ? bpm : 120;
  const stepDuration = 60 / cleanBpm / 4;
  const swingAmount =
    swingPercent <= 0
      ? 0
      : (swingPercent / 100) * 0.5;
  const events: ScheduledStepEvent[] = [];
  const totalSteps = 16;
  for (let offset = 0; offset < totalSteps; offset += 1) {
    const stepCount = fromStep + offset;
    const stepIndex =
      ((stepCount % totalSteps) + totalSteps) %
      totalSteps;
    const baseTime =
      startTime + offset * stepDuration;
    const isSwung = stepIndex % 2 === 1;
    const time = isSwung
      ? baseTime + stepDuration * swingAmount
      : baseTime;
    events.push({ stepIndex, time });
  }
  return events;
};


