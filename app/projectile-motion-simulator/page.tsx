import type { Metadata } from "next";
import ProjectileMotionSimulator from "@/components/ProjectileMotionSimulator";

export const metadata: Metadata = {
  title: "Projectile Motion Simulator (Physics) | LifeHackToolbox",
  description:
    "Simulate projectile motion with a trajectory plot and animation. Compute time of flight, max height, range, and impact velocity with Earth/Moon/Mars gravity presets and optional air resistance. Export PNG and CSV.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/projectile-motion-simulator"
  }
};

const ProjectileMotionSimulatorPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Projectile Motion Simulator (Physics)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Explore classic kinematics by launching a projectile at a chosen speed and angle.
          This simulator plots the trajectory, animates the motion, and reports time of flight,
          max height, range, and impact velocity. Everything runs in your browser.
        </p>
      </section>

      <section className="mt-6">
        <ProjectileMotionSimulator />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Projectile motion equations (no air resistance)
        </h2>
        <p>
          In the simplest model, gravity is constant and the only acceleration is downward:
          \(a_x = 0\) and \(a_y = -g\). If the initial speed is \(v_0\) and the launch angle is
          \(\theta\), the horizontal and vertical components are \(v_{x0} = v_0\cos(\theta)\) and
          \(v_{y0} = v_0\sin(\theta)\). The position over time is:
        </p>
        <p className="font-mono text-sm text-slate-900">
          x(t) = vₓ₀·t
          <br />
          y(t) = h₀ + vᵧ₀·t − ½·g·t²
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Time of flight, max height, and range
        </h3>
        <p>
          Time of flight is found by solving \(y(t)=0\) for the positive root. Max height occurs
          when vertical velocity crosses zero. Range is the horizontal distance at impact.
          This tool computes those values and shows how they change with angle, speed, gravity,
          and launch height.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Air resistance (simple model)
        </h3>
        <p>
          Air resistance depends on many factors and is often modeled with quadratic drag in
          advanced physics. For teaching intuition, this simulator offers a simple linear drag
          toggle that adds a force proportional to velocity. Enabling drag reduces range and
          max height, and changes the impact speed.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Notes and privacy
        </h3>
        <p>
          This tool is educational and makes simplifying assumptions (flat ground, constant gravity,
          stylized drag model). It runs entirely in the browser and stores your last settings in
          localStorage for convenience (clearing site data removes that history).
        </p>
      </section>
    </main>
  );
};

export default ProjectileMotionSimulatorPage;


