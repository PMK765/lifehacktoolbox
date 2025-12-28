import type { Metadata } from "next";
import MatrixCalculator from "@/components/MatrixCalculator";

export const metadata: Metadata = {
  title: "Matrix Calculator & Visualizer | LifeHackToolbox",
  description:
    "A fast matrix calculator for matrix multiplication, determinant, inverse, transpose, and solving Ax=b. Edit matrices A and B, export results as JSON/CSV, and run everything in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/matrix-calculator"
  }
};

const MatrixCalculatorPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Matrix Calculator &amp; Visualizer
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Build matrices A and B, run common operations, and export results. This matrix
          calculator supports matrix multiplication, determinant, inverse, transpose, and
          solving linear systems. Everything runs locally in your browser.
        </p>
      </section>

      <section className="mt-6">
        <MatrixCalculator />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          What is a matrix calculator?
        </h2>
        <p>
          A matrix calculator is a tool for working with matrices: rectangular grids of
          numbers that represent linear relationships. Matrices show up everywhere in
          algebra, geometry, physics, computer graphics, data science, statistics, and
          machine learning. Common tasks include matrix multiplication, finding a
          determinant, computing an inverse (when it exists), and solving systems of linear
          equations.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Matrix multiplication and dimension rules
        </h3>
        <p>
          Matrix multiplication is not element-by-element multiplication. If A is an{" "}
          <span className="font-mono">m×n</span> matrix and B is an{" "}
          <span className="font-mono">n×p</span> matrix, then the product{" "}
          <span className="font-mono">A×B</span> is defined and produces an{" "}
          <span className="font-mono">m×p</span> matrix. The inner dimensions must match:
          the number of columns in A must equal the number of rows in B. This calculator
          checks those rules and explains why an operation is invalid when dimensions do
          not align.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Determinant and inverse
        </h3>
        <p>
          The determinant is a number computed from a square matrix. It is especially
          useful for reasoning about whether the matrix is invertible. If{" "}
          <span className="font-mono">det(A) = 0</span>, the matrix is singular and has no
          inverse. If the determinant is non-zero, then an inverse exists. This matrix
          calculator can compute{" "}
          <span className="font-mono">det(A)</span> and{" "}
          <span className="font-mono">A⁻¹</span> for square matrices.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Solving a linear system Ax = b
        </h3>
        <p>
          Many problems can be written as{" "}
          <span className="font-mono">Ax = b</span>, where A is a square matrix, b is a
          vector of known values, and x is the unknown vector you want to find. This tool
          includes a solver for that scenario. If the system is singular or ill-posed, the
          solver will report that it cannot find a unique solution.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Exporting results (JSON and CSV)
        </h3>
        <p>
          When you’re done, you can copy the result as JSON or download it as a CSV file.
          JSON is convenient for code and APIs, while CSV is convenient for spreadsheets.
        </p>
        <p>
          This matrix calculator runs entirely in the browser. It does not upload your
          matrices to a server, and it stores your last-used settings in localStorage for
          convenience (clearing your browser data will remove that history).
        </p>
      </section>
    </main>
  );
};

export default MatrixCalculatorPage;


