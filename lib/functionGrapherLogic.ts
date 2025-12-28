export type AngleUnit = "radians" | "degrees";

export type Viewport = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type Token =
  | { type: "number"; value: number }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: "+" | "-" | "*" | "/" | "^" }
  | { type: "paren"; value: "(" | ")" };

export type AstNode =
  | { type: "number"; value: number }
  | { type: "variable" }
  | { type: "unary"; op: "neg"; expr: AstNode }
  | { type: "binary"; op: "+" | "-" | "*" | "/" | "^"; left: AstNode; right: AstNode }
  | { type: "call"; fn: FunctionName; arg: AstNode };

export type FunctionName =
  | "sin"
  | "cos"
  | "tan"
  | "sqrt"
  | "abs"
  | "log"
  | "exp";

export type ParseResult =
  | { ok: true; ast: AstNode }
  | { ok: false; message: string; index?: number };

export type TokenizeResult =
  | { ok: true; tokens: Token[] }
  | { ok: false; message: string; index?: number };

export const clampNumber = (
  value: number,
  min: number,
  max: number
): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const normalizeViewport = (viewport: Viewport): Viewport => {
  const xMin = Number.isFinite(viewport.xMin) ? viewport.xMin : -10;
  const xMax = Number.isFinite(viewport.xMax) ? viewport.xMax : 10;
  const yMin = Number.isFinite(viewport.yMin) ? viewport.yMin : -10;
  const yMax = Number.isFinite(viewport.yMax) ? viewport.yMax : 10;
  const fixedXMin = Math.min(xMin, xMax - 1e-6);
  const fixedXMax = Math.max(xMax, xMin + 1e-6);
  const fixedYMin = Math.min(yMin, yMax - 1e-6);
  const fixedYMax = Math.max(yMax, yMin + 1e-6);
  return { xMin: fixedXMin, xMax: fixedXMax, yMin: fixedYMin, yMax: fixedYMax };
};

const isDigit = (char: string): boolean => char >= "0" && char <= "9";
const isAlpha = (char: string): boolean =>
  (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");

const isFunctionName = (value: string): value is FunctionName => {
  const v = value.toLowerCase();
  return (
    v === "sin" ||
    v === "cos" ||
    v === "tan" ||
    v === "sqrt" ||
    v === "abs" ||
    v === "log" ||
    v === "exp"
  );
};

const shouldInsertImplicitMultiply = (prev: Token, next: Token): boolean => {
  const prevCanEnd =
    prev.type === "number" ||
    (prev.type === "identifier" && (prev.value.toLowerCase() === "x" || prev.value.toLowerCase() === "pi" || prev.value.toLowerCase() === "e")) ||
    (prev.type === "paren" && prev.value === ")");

  const nextCanStart =
    next.type === "number" ||
    (next.type === "identifier" && (next.value.toLowerCase() === "x" || isFunctionName(next.value))) ||
    (next.type === "paren" && next.value === "(");

  return prevCanEnd && nextCanStart;
};

export const tokenizeExpression = (expression: string): TokenizeResult => {
  const tokens: Token[] = [];
  const src = expression;
  let index = 0;

  while (index < src.length) {
    const ch = src[index];
    if (ch === " " || ch === "\n" || ch === "\t" || ch === "\r") {
      index += 1;
      continue;
    }
    if (isDigit(ch) || ch === ".") {
      const start = index;
      let hasDot = ch === ".";
      index += 1;
      while (index < src.length) {
        const c = src[index];
        if (isDigit(c)) {
          index += 1;
          continue;
        }
        if (c === "." && !hasDot) {
          hasDot = true;
          index += 1;
          continue;
        }
        break;
      }
      const text = src.slice(start, index);
      const value = Number(text);
      if (!Number.isFinite(value)) {
        return { ok: false, message: `Invalid number: "${text}"`, index: start };
      }
      tokens.push({ type: "number", value });
      continue;
    }
    if (isAlpha(ch)) {
      const start = index;
      index += 1;
      while (index < src.length) {
        const c = src[index];
        if (isAlpha(c) || isDigit(c) || c === "_") {
          index += 1;
          continue;
        }
        break;
      }
      const value = src.slice(start, index);
      tokens.push({ type: "identifier", value });
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "^") {
      tokens.push({ type: "operator", value: ch });
      index += 1;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      index += 1;
      continue;
    }
    return { ok: false, message: `Unexpected character "${ch}"`, index };
  }

  const withImplicit: Token[] = [];
  tokens.forEach((token, i) => {
    const prev = withImplicit[withImplicit.length - 1];
    if (prev && shouldInsertImplicitMultiply(prev, token)) {
      withImplicit.push({ type: "operator", value: "*" });
    }
    withImplicit.push(token);
    const next = tokens[i + 1];
    if (next && shouldInsertImplicitMultiply(token, next)) {
      // handled when next is processed
    }
  });

  return { ok: true, tokens: withImplicit };
};

type RpnItem =
  | { type: "number"; value: number }
  | { type: "variable" }
  | { type: "call"; fn: FunctionName }
  | { type: "operator"; op: "+" | "-" | "*" | "/" | "^" }
  | { type: "unary"; op: "neg" };

const precedence = (op: string): number => {
  if (op === "neg") return 4;
  if (op === "^") return 3;
  if (op === "*" || op === "/") return 2;
  if (op === "+" || op === "-") return 1;
  return 0;
};

const isRightAssociative = (op: string): boolean => op === "^" || op === "neg";

export const parseExpressionToAst = (expression: string): ParseResult => {
  const tokenized = tokenizeExpression(expression);
  if (!tokenized.ok) {
    return { ok: false, message: tokenized.message, index: tokenized.index };
  }
  const tokens = tokenized.tokens;
  if (tokens.length === 0) {
    return { ok: false, message: "Enter a function of x, like x^2 or sin(x)." };
  }

  const output: RpnItem[] = [];
  const stack: ({ kind: "op"; op: string } | { kind: "paren" } | { kind: "fn"; fn: FunctionName })[] = [];

  let prevToken: Token | null = null;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === "number") {
      output.push({ type: "number", value: token.value });
      prevToken = token;
      continue;
    }
    if (token.type === "identifier") {
      const v = token.value.toLowerCase();
      if (v === "x") {
        output.push({ type: "variable" });
      } else if (v === "pi") {
        output.push({ type: "number", value: Math.PI });
      } else if (v === "e") {
        output.push({ type: "number", value: Math.E });
      } else if (isFunctionName(v)) {
        stack.push({ kind: "fn", fn: v });
      } else {
        return { ok: false, message: `Unknown identifier "${token.value}".`, index: i };
      }
      prevToken = token;
      continue;
    }
    if (token.type === "operator") {
      const isUnary =
        token.value === "-" &&
        (!prevToken ||
          (prevToken.type === "operator") ||
          (prevToken.type === "paren" && prevToken.value === "("));
      const opKey = isUnary ? "neg" : token.value;

      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.kind === "paren" || top.kind === "fn") {
          break;
        }
        const topOp = top.op;
        const pTop = precedence(topOp);
        const pCur = precedence(opKey);
        const shouldPop =
          pTop > pCur ||
          (pTop === pCur && !isRightAssociative(opKey));
        if (!shouldPop) {
          break;
        }
        stack.pop();
        if (topOp === "neg") {
          output.push({ type: "unary", op: "neg" });
        } else if (
          topOp === "+" ||
          topOp === "-" ||
          topOp === "*" ||
          topOp === "/" ||
          topOp === "^"
        ) {
          output.push({ type: "operator", op: topOp });
        }
      }
      stack.push({ kind: "op", op: opKey });
      prevToken = token;
      continue;
    }
    if (token.type === "paren") {
      if (token.value === "(") {
        stack.push({ kind: "paren" });
        prevToken = token;
        continue;
      }
      while (stack.length > 0) {
        const top = stack.pop();
        if (!top) {
          break;
        }
        if (top.kind === "paren") {
          break;
        }
        if (top.kind === "fn") {
          output.push({ type: "call", fn: top.fn });
        } else if (top.op === "neg") {
          output.push({ type: "unary", op: "neg" });
        } else if (
          top.op === "+" ||
          top.op === "-" ||
          top.op === "*" ||
          top.op === "/" ||
          top.op === "^"
        ) {
          output.push({ type: "operator", op: top.op });
        }
      }
      const maybeFn = stack[stack.length - 1];
      if (maybeFn && maybeFn.kind === "fn") {
        stack.pop();
        output.push({ type: "call", fn: maybeFn.fn });
      }
      prevToken = token;
      continue;
    }
  }

  while (stack.length > 0) {
    const top = stack.pop();
    if (!top) break;
    if (top.kind === "paren") {
      return { ok: false, message: "Mismatched parentheses." };
    }
    if (top.kind === "fn") {
      output.push({ type: "call", fn: top.fn });
    } else if (top.op === "neg") {
      output.push({ type: "unary", op: "neg" });
    } else {
      output.push({ type: "operator", op: top.op as "+" | "-" | "*" | "/" | "^" });
    }
  }

  const astStack: AstNode[] = [];
  for (const item of output) {
    if (item.type === "number") {
      astStack.push({ type: "number", value: item.value });
    } else if (item.type === "variable") {
      astStack.push({ type: "variable" });
    } else if (item.type === "unary") {
      const expr = astStack.pop();
      if (!expr) {
        return { ok: false, message: "Invalid expression." };
      }
      astStack.push({ type: "unary", op: "neg", expr });
    } else if (item.type === "operator") {
      const right = astStack.pop();
      const left = astStack.pop();
      if (!left || !right) {
        return { ok: false, message: "Invalid expression." };
      }
      astStack.push({ type: "binary", op: item.op, left, right });
    } else if (item.type === "call") {
      const arg = astStack.pop();
      if (!arg) {
        return { ok: false, message: "Invalid function call." };
      }
      astStack.push({ type: "call", fn: item.fn, arg });
    }
  }
  if (astStack.length !== 1) {
    return { ok: false, message: "Invalid expression." };
  }
  return { ok: true, ast: astStack[0] };
};

const toRadians = (value: number, unit: AngleUnit): number =>
  unit === "degrees" ? (value * Math.PI) / 180 : value;

export const evaluateAst = (
  ast: AstNode,
  x: number,
  angleUnit: AngleUnit
): number => {
  if (ast.type === "number") {
    return ast.value;
  }
  if (ast.type === "variable") {
    return x;
  }
  if (ast.type === "unary") {
    const v = evaluateAst(ast.expr, x, angleUnit);
    return -v;
  }
  if (ast.type === "binary") {
    const left = evaluateAst(ast.left, x, angleUnit);
    const right = evaluateAst(ast.right, x, angleUnit);
    if (ast.op === "+") return left + right;
    if (ast.op === "-") return left - right;
    if (ast.op === "*") return left * right;
    if (ast.op === "/") return right === 0 ? Number.NaN : left / right;
    return left ** right;
  }
  const arg = evaluateAst(ast.arg, x, angleUnit);
  if (ast.fn === "sin") return Math.sin(toRadians(arg, angleUnit));
  if (ast.fn === "cos") return Math.cos(toRadians(arg, angleUnit));
  if (ast.fn === "tan") return Math.tan(toRadians(arg, angleUnit));
  if (ast.fn === "sqrt") return arg < 0 ? Number.NaN : Math.sqrt(arg);
  if (ast.fn === "abs") return Math.abs(arg);
  if (ast.fn === "log") return arg <= 0 ? Number.NaN : Math.log(arg);
  return Math.exp(arg);
};

export type InterceptInfo = {
  xIntercepts: number[];
  yIntercept?: { x: 0; y: number };
};

const sign = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
};

const bisection = (
  f: (x: number) => number,
  a: number,
  b: number,
  iterations = 30
): number | null => {
  let left = a;
  let right = b;
  let fLeft = f(left);
  let fRight = f(right);
  if (!Number.isFinite(fLeft) || !Number.isFinite(fRight)) {
    return null;
  }
  const sLeft = sign(fLeft);
  const sRight = sign(fRight);
  if (sLeft === 0) return left;
  if (sRight === 0) return right;
  if (sLeft === sRight) return null;
  for (let i = 0; i < iterations; i += 1) {
    const mid = (left + right) / 2;
    const fMid = f(mid);
    if (!Number.isFinite(fMid)) {
      return null;
    }
    const sMid = sign(fMid);
    if (sMid === 0) {
      return mid;
    }
    if (sMid === sLeft) {
      left = mid;
      fLeft = fMid;
    } else {
      right = mid;
      fRight = fMid;
    }
  }
  return (left + right) / 2;
};

export const findIntercepts = (
  ast: AstNode,
  viewport: Viewport,
  angleUnit: AngleUnit
): InterceptInfo => {
  const view = normalizeViewport(viewport);
  const f = (x: number) => evaluateAst(ast, x, angleUnit);
  const samples = 500;
  const xIntercepts: number[] = [];

  const y0 =
    view.xMin <= 0 && view.xMax >= 0 ? f(0) : undefined;

  let prevX = view.xMin;
  let prevY = f(prevX);
  for (let i = 1; i <= samples; i += 1) {
    const x =
      view.xMin +
      (i / samples) * (view.xMax - view.xMin);
    const y = f(x);
    if (Number.isFinite(prevY) && Number.isFinite(y)) {
      const s1 = sign(prevY);
      const s2 = sign(y);
      if (s1 === 0) {
        xIntercepts.push(prevX);
      } else if (s2 === 0) {
        xIntercepts.push(x);
      } else if (s1 !== s2) {
        const root = bisection(f, prevX, x);
        if (root !== null) {
          xIntercepts.push(root);
        }
      }
    }
    prevX = x;
    prevY = y;
  }

  xIntercepts.sort((a, b) => a - b);
  const deduped: number[] = [];
  const tolerance = (view.xMax - view.xMin) / 400;
  xIntercepts.forEach((val) => {
    const last = deduped[deduped.length - 1];
    if (
      typeof last === "number" &&
      Math.abs(val - last) < tolerance
    ) {
      return;
    }
    if (Number.isFinite(val)) {
      deduped.push(val);
    }
  });

  const yIntercept =
    typeof y0 === "number" && Number.isFinite(y0)
      ? { x: 0 as const, y: y0 }
      : undefined;

  return { xIntercepts: deduped.slice(0, 6), yIntercept };
};

export type SamplePoint = { x: number; y: number };

export const buildSampleTable = (
  ast: AstNode,
  viewport: Viewport,
  angleUnit: AngleUnit,
  count = 9
): SamplePoint[] => {
  const view = normalizeViewport(viewport);
  const safeCount = Math.max(3, Math.min(25, Math.round(count)));
  const points: SamplePoint[] = [];
  for (let i = 0; i < safeCount; i += 1) {
    const x =
      view.xMin +
      (i / (safeCount - 1)) *
        (view.xMax - view.xMin);
    const y = evaluateAst(ast, x, angleUnit);
    points.push({ x, y });
  }
  return points;
};

export type QuadraticCoefficients = {
  a: number;
  b: number;
  c: number;
};

const extractConstant = (node: AstNode): number | null => {
  if (node.type === "number") return node.value;
  if (node.type === "unary") {
    const v = extractConstant(node.expr);
    return v === null ? null : -v;
  }
  return null;
};

const addPoly = (
  p: QuadraticCoefficients,
  q: QuadraticCoefficients
): QuadraticCoefficients => ({
  a: p.a + q.a,
  b: p.b + q.b,
  c: p.c + q.c
});

const subPoly = (
  p: QuadraticCoefficients,
  q: QuadraticCoefficients
): QuadraticCoefficients => ({
  a: p.a - q.a,
  b: p.b - q.b,
  c: p.c - q.c
});

const mulByScalar = (
  p: QuadraticCoefficients,
  k: number
): QuadraticCoefficients => ({
  a: p.a * k,
  b: p.b * k,
  c: p.c * k
});

const mulPoly = (
  p: QuadraticCoefficients,
  q: QuadraticCoefficients
): QuadraticCoefficients | null => {
  const a2 = p.a * q.c + p.c * q.a + p.b * q.b;
  const b2 = p.b * q.c + p.c * q.b;
  const c2 = p.c * q.c;
  if (!Number.isFinite(a2) || !Number.isFinite(b2) || !Number.isFinite(c2)) {
    return null;
  }
  const degreeP = p.a !== 0 ? 2 : p.b !== 0 ? 1 : 0;
  const degreeQ = q.a !== 0 ? 2 : q.b !== 0 ? 1 : 0;
  if (degreeP + degreeQ > 2) {
    return null;
  }
  return { a: a2, b: b2, c: c2 };
};

const polyFromNode = (node: AstNode): QuadraticCoefficients | null => {
  if (node.type === "number") {
    return { a: 0, b: 0, c: node.value };
  }
  if (node.type === "variable") {
    return { a: 0, b: 1, c: 0 };
  }
  if (node.type === "unary") {
    const inner = polyFromNode(node.expr);
    return inner ? mulByScalar(inner, -1) : null;
  }
  if (node.type === "binary") {
    if (node.op === "+" || node.op === "-") {
      const left = polyFromNode(node.left);
      const right = polyFromNode(node.right);
      if (!left || !right) return null;
      return node.op === "+" ? addPoly(left, right) : subPoly(left, right);
    }
    if (node.op === "*") {
      const leftConst = extractConstant(node.left);
      const rightConst = extractConstant(node.right);
      if (leftConst !== null) {
        const right = polyFromNode(node.right);
        return right ? mulByScalar(right, leftConst) : null;
      }
      if (rightConst !== null) {
        const left = polyFromNode(node.left);
        return left ? mulByScalar(left, rightConst) : null;
      }
      const left = polyFromNode(node.left);
      const right = polyFromNode(node.right);
      if (!left || !right) return null;
      return mulPoly(left, right);
    }
    if (node.op === "^") {
      const base = node.left;
      const exponent = extractConstant(node.right);
      if (exponent === null) return null;
      if (base.type === "variable" && exponent === 2) {
        return { a: 1, b: 0, c: 0 };
      }
      if (base.type === "variable" && exponent === 1) {
        return { a: 0, b: 1, c: 0 };
      }
      if (base.type === "variable" && exponent === 0) {
        return { a: 0, b: 0, c: 1 };
      }
    }
  }
  return null;
};

export const matchQuadratic = (ast: AstNode): QuadraticCoefficients | null => {
  const poly = polyFromNode(ast);
  if (!poly) return null;
  if (!Number.isFinite(poly.a) || !Number.isFinite(poly.b) || !Number.isFinite(poly.c)) {
    return null;
  }
  return poly;
};

export type TrigFormMatch = {
  fn: "sin" | "cos";
  a: number;
  b: number;
  c: number;
  d: number;
};

const isX = (node: AstNode): boolean => node.type === "variable";

const matchLinear = (node: AstNode): { m: number; b: number } | null => {
  const poly = polyFromNode(node);
  if (!poly) return null;
  if (poly.a !== 0) return null;
  return { m: poly.b, b: poly.c };
};

export const matchTrigForm = (ast: AstNode): TrigFormMatch | null => {
  const peelAdd = (node: AstNode): { core: AstNode; d: number } => {
    if (node.type === "binary" && (node.op === "+" || node.op === "-")) {
      const rightConst = extractConstant(node.right);
      if (rightConst !== null) {
        const d = node.op === "+" ? rightConst : -rightConst;
        return { core: node.left, d };
      }
      const leftConst = extractConstant(node.left);
      if (leftConst !== null && node.op === "+") {
        return { core: node.right, d: leftConst };
      }
    }
    return { core: node, d: 0 };
  };

  const { core, d } = peelAdd(ast);

  const matchScaled = (node: AstNode): { k: number; inner: AstNode } | null => {
    if (node.type === "call" && (node.fn === "sin" || node.fn === "cos")) {
      return { k: 1, inner: node.arg };
    }
    if (node.type === "binary" && node.op === "*") {
      const leftConst = extractConstant(node.left);
      const rightConst = extractConstant(node.right);
      if (leftConst !== null && node.right.type === "call") {
        const call = node.right;
        if (call.fn === "sin" || call.fn === "cos") {
          return { k: leftConst, inner: call.arg };
        }
      }
      if (rightConst !== null && node.left.type === "call") {
        const call = node.left;
        if (call.fn === "sin" || call.fn === "cos") {
          return { k: rightConst, inner: call.arg };
        }
      }
    }
    return null;
  };

  const scaled = matchScaled(core);
  if (!scaled) return null;

  const linear = matchLinear(scaled.inner);
  if (!linear) {
    if (isX(scaled.inner)) {
      return {
        fn:
          core.type === "call" && core.fn === "cos"
            ? "cos"
            : "sin",
        a: scaled.k,
        b: 1,
        c: 0,
        d
      };
    }
    return null;
  }

  const fnName =
    core.type === "call" && core.fn === "cos"
      ? "cos"
      : core.type === "binary" &&
        core.op === "*" &&
        ((core.left.type === "call" && core.left.fn === "cos") ||
          (core.right.type === "call" && core.right.fn === "cos"))
      ? "cos"
      : "sin";

  return {
    fn: fnName,
    a: scaled.k,
    b: linear.m,
    c: linear.b,
    d
  };
};


