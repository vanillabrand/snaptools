import { useState, useMemo } from "react";
import { PoundSterling, TrendingUp, Building2, Calculator } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function fmt(n: number): string {
  return n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtInt(n: number): string {
  return n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function calcStampDuty(price: number, isFirstTime: boolean, isAdditional: boolean): number {
  if (isAdditional) {
    // Additional property: 5% surcharge on all bands (2025 rates)
    if (price <= 250000) return price * 0.05;
    if (price <= 925000) return 250000 * 0.05 + (price - 250000) * 0.1;
    if (price <= 1500000) return 250000 * 0.05 + 675000 * 0.1 + (price - 925000) * 0.15;
    return 250000 * 0.05 + 675000 * 0.1 + 575000 * 0.15 + (price - 1500000) * 0.17;
  }
  if (isFirstTime && price <= 625000) {
    // First-time buyer relief
    if (price <= 425000) return 0;
    return (price - 425000) * 0.05;
  }
  // Standard rates
  if (price <= 250000) return 0;
  if (price <= 925000) return (price - 250000) * 0.05;
  if (price <= 1500000) return 250000 * 0.05 + (price - 925000) * 0.1;
  return 250000 * 0.05 + 675000 * 0.1 + 575000 * 0.15 + (price - 1500000) * 0.12;
}

export function MortgageCalculator() {
  const [price, setPrice] = useState(300000);
  const [deposit, setDeposit] = useState(30000);
  const [rate, setRate] = useState(4.5);
  const [term, setTerm] = useState(25);
  const [buyerType, setBuyerType] = useState<"standard" | "firstTime" | "additional">("standard");

  const results = useMemo(() => {
    const loanAmount = Math.max(price - deposit, 0);
    const ltv = price > 0 ? (loanAmount / price) * 100 : 0;
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0 && numPayments > 0) {
      monthlyPayment =
        (loanAmount * (monthlyRate * (1 + monthlyRate) ** numPayments)) /
        ((1 + monthlyRate) ** numPayments - 1);
    } else if (numPayments > 0) {
      monthlyPayment = loanAmount / numPayments;
    }

    const totalRepaid = monthlyPayment * numPayments;
    const totalInterest = totalRepaid - loanAmount;
    const stampDuty = calcStampDuty(price, buyerType === "firstTime", buyerType === "additional");
    const totalUpfront = deposit + stampDuty;

    // Yearly breakdown (first 5 years)
    const yearlyBreakdown: { year: number; principal: number; interest: number; balance: number }[] = [];
    let balance = loanAmount;
    for (let y = 1; y <= Math.min(term, 5); y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const intPayment = balance * monthlyRate;
        const princPayment = monthlyPayment - intPayment;
        yearInterest += intPayment;
        yearPrincipal += princPayment;
        balance -= princPayment;
      }
      yearlyBreakdown.push({
        year: y,
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(balance, 0),
      });
    }

    return { loanAmount, ltv, monthlyPayment, totalRepaid, totalInterest, stampDuty, totalUpfront, yearlyBreakdown };
  }, [price, deposit, rate, term, buyerType]);

  const depPct = price > 0 ? ((deposit / price) * 100).toFixed(0) : "0";

  return (
    <ToolLayout
      name="Mortgage Calculator"
      description="Calculate UK mortgage repayments, stamp duty, and costs. All calculations are estimates."
      icon={PoundSterling}
    >
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-5 space-y-5">
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Property Details
            </h3>

            <div>
              <Label className="text-sm mb-1.5">Property Price (£)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step={5000}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm">Deposit (£)</Label>
                <span className="text-xs text-muted-foreground">{depPct}% deposit</span>
              </div>
              <Input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                min={0}
                step={1000}
              />
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(Number(depPct), 100)}%` }}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-1.5">Buyer Type</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ["standard", "Standard"],
                    ["firstTime", "First-Time"],
                    ["additional", "Additional"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setBuyerType(val)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      buyerType === val
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-5">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Mortgage Terms
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm">Interest Rate (%)</Label>
                <span className="text-xs font-mono text-muted-foreground">{rate}%</span>
              </div>
              <Input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                min={0}
                max={20}
                step={0.1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm">Term (years)</Label>
                <span className="text-xs font-mono text-muted-foreground">{term} yrs</span>
              </div>
              <input
                type="range"
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                min={5}
                max={40}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>5 yrs</span>
                <span>40 yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5">
          {/* Monthly payment highlight */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Monthly Repayment
            </p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight">
              £{fmt(results.monthlyPayment)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {results.ltv.toFixed(0)}% LTV — £{fmtInt(results.loanAmount)} loan over {term} years
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Repaid", value: `£${fmtInt(results.totalRepaid)}` },
              { label: "Total Interest", value: `£${fmtInt(results.totalInterest)}` },
              { label: "Stamp Duty", value: `£${fmtInt(results.stampDuty)}` },
              { label: "Total Upfront", value: `£${fmtInt(results.totalUpfront)}` },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                <p className="text-lg font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Cost breakdown bar */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calculator className="size-4 text-primary" />
              Cost Breakdown
            </h3>
            <div className="h-4 bg-muted rounded-full overflow-hidden flex">
              <div
                className="bg-primary h-full transition-all"
                style={{
                  width: `${results.totalRepaid > 0 ? (results.loanAmount / results.totalRepaid) * 100 : 50}%`,
                }}
                title="Principal"
              />
              <div
                className="bg-destructive h-full transition-all"
                style={{
                  width: `${results.totalRepaid > 0 ? (results.totalInterest / results.totalRepaid) * 100 : 50}%`,
                }}
                title="Interest"
              />
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                Principal: £{fmtInt(results.loanAmount)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-destructive" />
                Interest: £{fmtInt(results.totalInterest)}
              </span>
            </div>
          </div>

          {/* Yearly schedule */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Repayment Schedule (First 5 Years)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left py-2 font-medium">Year</th>
                    <th className="text-right py-2 font-medium">Principal</th>
                    <th className="text-right py-2 font-medium">Interest</th>
                    <th className="text-right py-2 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="border-b border-border/50">
                      <td className="py-2 font-medium">{row.year}</td>
                      <td className="py-2 text-right">£{fmtInt(row.principal)}</td>
                      <td className="py-2 text-right text-destructive">£{fmtInt(row.interest)}</td>
                      <td className="py-2 text-right font-medium">£{fmtInt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
