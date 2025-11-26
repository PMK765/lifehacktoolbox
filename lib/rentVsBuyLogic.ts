export type RentVsBuyInputs = {
  homePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  closingCostPercent: number;
  propertyTaxRate: number;
  insurancePerYear: number;
  hoaPerMonth: number;
  maintenancePercent: number;
  appreciationRate: number;
  currentRent: number;
  rentIncreaseRate: number;
  rentersInsurancePerMonth: number;
  investmentReturnRate: number;
  horizonYears: number;
  sellingCostPercent: number;
};

export type YearlyHomeOutcome = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  homeValue: number;
  equity: number;
  totalOwnerCashOutflow: number;
};

export type YearlyRentOutcome = {
  year: number;
  annualRentPaid: number;
  rentAmountThisYear: number;
  investmentBalance: number;
  totalRenterCashOutflow: number;
};

export type YearlyComparison = {
  year: number;
  ownerNetWorth: number;
  renterNetWorth: number;
};

const clampPositive = (value: number, fallback: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
};

const clampPercent = (value: number): number => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return value;
};

export const calculateMonthlyMortgagePayment = (
  principal: number,
  annualRate: number,
  termYears: number
): number => {
  const cleanPrincipal = principal > 0 ? principal : 0;
  const months = Math.max(1, Math.round(termYears * 12));
  const monthlyRate = annualRate > 0 ? annualRate / 12 / 100 : 0;
  if (monthlyRate === 0) {
    return cleanPrincipal / months;
  }
  const factor = (1 + monthlyRate) ** months;
  const payment = (cleanPrincipal * monthlyRate * factor) / (factor - 1);
  return payment;
};

export const buildHomeTimeline = (
  inputs: RentVsBuyInputs
): YearlyHomeOutcome[] => {
  const horizonYears = Math.max(1, Math.min(40, Math.round(inputs.horizonYears)));
  const homePrice = clampPositive(inputs.homePrice, 300000);
  const downPaymentPercent = clampPercent(inputs.downPaymentPercent);
  const interestRate = inputs.interestRate < 0 ? 0 : inputs.interestRate;
  const loanTermYears = Math.max(1, Math.round(inputs.loanTermYears));
  const closingCostPercent = clampPercent(inputs.closingCostPercent);
  const propertyTaxRate = inputs.propertyTaxRate < 0 ? 0 : inputs.propertyTaxRate;
  const insurancePerYear = inputs.insurancePerYear < 0 ? 0 : inputs.insurancePerYear;
  const hoaPerMonth = inputs.hoaPerMonth < 0 ? 0 : inputs.hoaPerMonth;
  const maintenancePercent = inputs.maintenancePercent < 0 ? 0 : inputs.maintenancePercent;
  const appreciationRate = inputs.appreciationRate < 0 ? 0 : inputs.appreciationRate;

  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanAmount = Math.max(0, homePrice - downPayment);
  const monthlyPayment = calculateMonthlyMortgagePayment(loanAmount, interestRate, loanTermYears);

  const annualPropertyTaxRate = propertyTaxRate / 100;
  const annualMaintenanceRate = maintenancePercent / 100;
  const appreciation = appreciationRate / 100;
  const annualHoa = hoaPerMonth * 12;

  const buyerClosingCosts = homePrice * (closingCostPercent / 100);
  const amortizedClosingPerYear = buyerClosingCosts / horizonYears;

  const monthlyRate = interestRate > 0 ? interestRate / 12 / 100 : 0;
  let balance = loanAmount;
  let homeValue = homePrice;

  const results: YearlyHomeOutcome[] = [];

  for (let year = 1; year <= horizonYears; year += 1) {
    let principalPaid = 0;
    let interestPaid = 0;
    for (let month = 1; month <= 12; month += 1) {
      if (balance <= 0) {
        break;
      }
      const interest = balance * monthlyRate;
      const principalComponent = monthlyPayment - interest;
      const appliedPrincipal =
        principalComponent > balance ? balance : principalComponent;
      interestPaid += interest;
      principalPaid += appliedPrincipal;
      balance -= appliedPrincipal;
      if (balance < 0) {
        balance = 0;
      }
    }
    homeValue *= 1 + appreciation;
    const equity = homeValue - balance;
    const annualPropertyTax = homeValue * annualPropertyTaxRate;
    const annualMaintenance = homeValue * annualMaintenanceRate;
    const principalInterestPaid = monthlyPayment * 12;
    const totalOwnerCashOutflow =
      principalInterestPaid +
      annualPropertyTax +
      insurancePerYear +
      annualHoa +
      annualMaintenance +
      amortizedClosingPerYear;
    results.push({
      year,
      principalPaid,
      interestPaid,
      remainingBalance: balance,
      homeValue,
      equity,
      totalOwnerCashOutflow
    });
  }

  return results;
};

export const buildRentTimeline = (
  inputs: RentVsBuyInputs,
  ownerTimeline: YearlyHomeOutcome[]
): YearlyRentOutcome[] => {
  const horizonYears = Math.max(1, Math.min(40, Math.round(inputs.horizonYears)));
  const homePrice = clampPositive(inputs.homePrice, 300000);
  const downPaymentPercent = clampPercent(inputs.downPaymentPercent);
  const closingCostPercent = clampPercent(inputs.closingCostPercent);

  const currentRent = inputs.currentRent < 0 ? 0 : inputs.currentRent;
  const rentIncreaseRate = inputs.rentIncreaseRate < 0 ? 0 : inputs.rentIncreaseRate;
  const rentersInsurancePerMonth =
    inputs.rentersInsurancePerMonth < 0 ? 0 : inputs.rentersInsurancePerMonth;
  const investmentReturnRate =
    inputs.investmentReturnRate < 0 ? 0 : inputs.investmentReturnRate;

  const downPayment = homePrice * (downPaymentPercent / 100);
  const closingIfBuying = homePrice * (closingCostPercent / 100);
  const initialInvestment = downPayment + closingIfBuying;

  const rentersInsurancePerYear = rentersInsurancePerMonth * 12;
  const rentGrowth = rentIncreaseRate / 100;
  const investmentAnnualRate = investmentReturnRate / 100;

  let investmentBalance = initialInvestment;

  const results: YearlyRentOutcome[] = [];

  for (let year = 1; year <= horizonYears; year += 1) {
    const rentThisYearMonthly = currentRent * (1 + rentGrowth) ** (year - 1);
    const annualRentPaid = rentThisYearMonthly * 12;
    const totalRenterCashOutflow = annualRentPaid + rentersInsurancePerYear;

    const ownerOutflow =
      ownerTimeline[year - 1]?.totalOwnerCashOutflow ?? totalRenterCashOutflow;
    const contribution =
      ownerOutflow > totalRenterCashOutflow
        ? ownerOutflow - totalRenterCashOutflow
        : 0;

    investmentBalance =
      investmentBalance * (1 + investmentAnnualRate) + contribution;

    results.push({
      year,
      annualRentPaid,
      rentAmountThisYear: rentThisYearMonthly,
      investmentBalance,
      totalRenterCashOutflow
    });
  }

  return results;
};

export const buildComparisonTimeline = (
  ownerTimeline: YearlyHomeOutcome[],
  renterTimeline: YearlyRentOutcome[],
  inputs: RentVsBuyInputs
): {
  comparison: YearlyComparison[];
  breakEvenYear: number | null;
} => {
  const sellingCostPercent = clampPercent(inputs.sellingCostPercent);
  const sellingCostRate = sellingCostPercent / 100;

  const years = Math.min(ownerTimeline.length, renterTimeline.length);
  const comparison: YearlyComparison[] = [];
  let breakEvenYear: number | null = null;

  for (let index = 0; index < years; index += 1) {
    const ownerYear = ownerTimeline[index];
    const renterYear = renterTimeline[index];
    const sellingCosts = ownerYear.homeValue * sellingCostRate;
    const ownerNetWorth = ownerYear.equity - sellingCosts;
    const renterNetWorth = renterYear.investmentBalance;
    comparison.push({
      year: ownerYear.year,
      ownerNetWorth,
      renterNetWorth
    });
    if (breakEvenYear === null && ownerNetWorth > renterNetWorth) {
      breakEvenYear = ownerYear.year;
    }
  }

  return { comparison, breakEvenYear };
};


