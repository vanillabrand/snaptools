import { useState, useRef, useCallback } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Upload,
  Palette,
  Eye,
  PenLine,
  X,
} from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  toName: string;
  toAddress: string;
  toEmail: string;
  items: LineItem[];
  taxRate: number;
  discount: number;
  currency: string;
  notes: string;
  paymentTerms: string;
  accentColor: string;
  logo: string | null;
}

const currencies: { code: string; symbol: string; name: string }[] = [
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const accentColors = [
  "#1e293b", "#0f172a", "#1e40af", "#1d4ed8", "#7c3aed",
  "#c026d3", "#dc2626", "#ea580c", "#d97706", "#059669",
  "#0d9488", "#0891b2", "#2563eb", "#4f46e5",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const today = new Date().toISOString().split("T")[0];
const due30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

const initial: InvoiceData = {
  invoiceNumber: `INV-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  date: today,
  dueDate: due30,
  fromName: "",
  fromAddress: "",
  fromEmail: "",
  toName: "",
  toAddress: "",
  toEmail: "",
  items: [{ id: uid(), description: "", quantity: 1, rate: 0 }],
  taxRate: 20,
  discount: 0,
  currency: "GBP",
  notes: "",
  paymentTerms: "Payment due within 30 days of invoice date.",
  accentColor: "#1e293b",
  logo: null,
};

function fmtMoney(n: number, sym: string) {
  return `${sym}${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateStr(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

/* ═══════════════════════════════════════════
   LIVE PREVIEW COMPONENT
   ═══════════════════════════════════════════ */
function InvoicePreview({ data, sym }: { data: InvoiceData; sym: string }) {
  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const discountAmt = subtotal * (data.discount / 100);
  const taxable = subtotal - discountAmt;
  const tax = taxable * (data.taxRate / 100);
  const total = taxable + tax;
  const c = data.accentColor;

  return (
    <div
      id="invoice-preview"
      className="bg-white text-gray-900 rounded-xl shadow-lg overflow-hidden"
      style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Top accent bar */}
      <div className="h-2" style={{ background: c }} />

      <div className="p-8 md:p-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {data.logo ? (
              <img src={data.logo} alt="Logo" className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                style={{ background: c }}
              >
                {data.fromName ? data.fromName[0]?.toUpperCase() : "?"}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold" style={{ color: c }}>
                {data.fromName || "Your Company"}
              </h2>
              {data.fromEmail && (
                <p className="text-xs text-gray-500 mt-0.5">{data.fromEmail}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: c }}>
              INVOICE
            </h1>
            <p className="text-sm font-mono text-gray-500 mt-1">{data.invoiceNumber}</p>
          </div>
        </div>

        {/* Addresses + dates */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: c }}>
              From
            </p>
            <p className="text-sm font-semibold">{data.fromName || "—"}</p>
            <p className="text-xs text-gray-500 whitespace-pre-line mt-1">{data.fromAddress}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: c }}>
              Bill To
            </p>
            <p className="text-sm font-semibold">{data.toName || "—"}</p>
            <p className="text-xs text-gray-500 whitespace-pre-line mt-1">{data.toAddress}</p>
            {data.toEmail && <p className="text-xs text-gray-500 mt-1">{data.toEmail}</p>}
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="space-y-2 text-right md:text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>
                  Date
                </p>
                <p className="text-sm">{formatDateStr(data.date)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>
                  Due Date
                </p>
                <p className="text-sm">{formatDateStr(data.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Line items table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: c }}>
                <th className="text-left py-3 px-4 text-white font-semibold text-xs uppercase tracking-wider">
                  Description
                </th>
                <th className="text-center py-3 px-4 text-white font-semibold text-xs uppercase tracking-wider w-20">
                  Qty
                </th>
                <th className="text-right py-3 px-4 text-white font-semibold text-xs uppercase tracking-wider w-28">
                  Rate
                </th>
                <th className="text-right py-3 px-4 text-white font-semibold text-xs uppercase tracking-wider w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                  <td className="py-3 px-4">{item.description || "—"}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{fmtMoney(item.rate, sym)}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {fmtMoney(item.quantity * item.rate, sym)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{fmtMoney(subtotal, sym)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount ({data.discount}%)</span>
                <span className="text-green-600">-{fmtMoney(discountAmt, sym)}</span>
              </div>
            )}
            {data.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Tax ({data.taxRate}%)
                </span>
                <span>{fmtMoney(tax, sym)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold" style={{ color: c }}>
                  Total Due
                </span>
                <span className="text-2xl font-extrabold" style={{ color: c }}>
                  {fmtMoney(total, sym)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes / Payment terms */}
        {(data.notes || data.paymentTerms) && (
          <div className="border-t border-gray-200 pt-6 grid md:grid-cols-2 gap-6">
            {data.notes && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: c }}>
                  Notes
                </p>
                <p className="text-xs text-gray-500 whitespace-pre-line">{data.notes}</p>
              </div>
            )}
            {data.paymentTerms && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: c }}>
                  Payment Terms
                </p>
                <p className="text-xs text-gray-500 whitespace-pre-line">{data.paymentTerms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-400 pt-4 border-t border-gray-100">
          Thank you for your business — Generated with SnapTools
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export function InvoiceGenerator() {
  const [data, setData] = useState<InvoiceData>(initial);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const sym = currencies.find((c) => c.code === data.currency)?.symbol || "£";

  const update = useCallback((partial: Partial<InvoiceData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateItem = useCallback((id: string, partial: Partial<LineItem>) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, ...partial } : i)),
    }));
  }, []);

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { id: uid(), description: "", quantity: 1, rate: 0 }],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((i) => i.id !== id) : prev.items,
    }));
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update({ logo: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const discountAmt = subtotal * (data.discount / 100);
  const taxable = subtotal - discountAmt;
  const tax = taxable * (data.taxRate / 100);
  const total = taxable + tax;

  /* ─── PDF Download via hidden iframe print ─── */
  const downloadPDF = () => {
    const previewEl = document.getElementById("invoice-preview");
    if (!previewEl) {
      setView("preview");
      toast.info("Switched to preview — click Download PDF again.");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Invoice ${data.invoiceNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @page { margin: 0; size: A4; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>${previewEl.outerHTML}</body></html>`);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    };

    // Force onload for browsers that already fired it
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {
          /* ignore */
        }
      }, 1000);
    }, 1500);

    toast.success("Print dialog opened — save as PDF!");
  };

  return (
    <ToolLayout
      name="Invoice Generator"
      description="Create beautiful, professional invoices in seconds. Fill in the details, preview, and download as PDF."
      icon={FileText}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex gap-1.5">
          <Button
            variant={view === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("edit")}
            className="gap-1.5"
          >
            <PenLine className="size-3.5" />
            Edit
          </Button>
          <Button
            variant={view === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("preview")}
            className="gap-1.5"
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
        </div>
        <Button onClick={downloadPDF} className="gap-2">
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>

      {view === "preview" ? (
        /* ═══ PREVIEW ═══ */
        <div className="max-w-3xl mx-auto">
          <InvoicePreview data={data} sym={sym} />
        </div>
      ) : (
        /* ═══ EDIT MODE ═══ */
        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
          {/* Form */}
          <div className="space-y-5">
            {/* Invoice details */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Invoice Details
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs mb-1.5">Invoice Number</Label>
                  <Input
                    value={data.invoiceNumber}
                    onChange={(e) => update({ invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Date</Label>
                  <Input
                    type="date"
                    value={data.date}
                    onChange={(e) => update({ date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Due Date</Label>
                  <Input
                    type="date"
                    value={data.dueDate}
                    onChange={(e) => update({ dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5">Currency</Label>
                  <select
                    value={data.currency}
                    onChange={(e) => update({ currency: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Logo</Label>
                  <div className="flex items-center gap-2">
                    {data.logo ? (
                      <div className="relative">
                        <img src={data.logo} alt="Logo" className="h-9 w-9 rounded-lg object-cover border" />
                        <button
                          type="button"
                          onClick={() => update({ logo: null })}
                          className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-destructive text-white flex items-center justify-center cursor-pointer"
                        >
                          <X className="size-2.5" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        className="gap-1.5"
                      >
                        <Upload className="size-3.5" />
                        Upload Logo
                      </Button>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogo}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* From / To */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-sm">From (Your Details)</h3>
                <div>
                  <Label className="text-xs mb-1.5">Name / Company</Label>
                  <Input
                    value={data.fromName}
                    onChange={(e) => update({ fromName: e.target.value })}
                    placeholder="Acme Ltd"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Email</Label>
                  <Input
                    value={data.fromEmail}
                    onChange={(e) => update({ fromEmail: e.target.value })}
                    placeholder="hello@acme.com"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Address</Label>
                  <Textarea
                    value={data.fromAddress}
                    onChange={(e) => update({ fromAddress: e.target.value })}
                    placeholder="123 High Street&#10;London, SW1A 1AA"
                    className="min-h-[70px] resize-none text-sm"
                  />
                </div>
              </div>
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-sm">Bill To (Client)</h3>
                <div>
                  <Label className="text-xs mb-1.5">Name / Company</Label>
                  <Input
                    value={data.toName}
                    onChange={(e) => update({ toName: e.target.value })}
                    placeholder="Client Corp"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Email</Label>
                  <Input
                    value={data.toEmail}
                    onChange={(e) => update({ toEmail: e.target.value })}
                    placeholder="billing@client.com"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Address</Label>
                  <Textarea
                    value={data.toAddress}
                    onChange={(e) => update({ toAddress: e.target.value })}
                    placeholder="456 Business Road&#10;Manchester, M1 1AA"
                    className="min-h-[70px] resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Line Items</h3>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5 h-7 text-xs">
                  <Plus className="size-3" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {/* Header for larger screens */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_36px] gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  <span>Description</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Rate ({sym})</span>
                  <span />
                </div>

                {data.items.map((item) => (
                  <div key={item.id} className="grid sm:grid-cols-[1fr_80px_100px_36px] gap-2 items-start">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      placeholder="Web design services"
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                      min={0}
                      className="text-center text-sm"
                    />
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) })}
                      min={0}
                      step={0.01}
                      className="text-right text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="size-9 text-muted-foreground hover:text-destructive shrink-0"
                      disabled={data.items.length <= 1}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax, Discount, Notes */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-sm">Tax &amp; Discount</h3>
                <div>
                  <Label className="text-xs mb-1.5">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={data.taxRate}
                    onChange={(e) => update({ taxRate: Number(e.target.value) })}
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Discount (%)</Label>
                  <Input
                    type="number"
                    value={data.discount}
                    onChange={(e) => update({ discount: Number(e.target.value) })}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-sm">Notes &amp; Terms</h3>
                <div>
                  <Label className="text-xs mb-1.5">Notes</Label>
                  <Textarea
                    value={data.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                    placeholder="Thank you for your business"
                    className="min-h-[50px] resize-none text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Payment Terms</Label>
                  <Textarea
                    value={data.paymentTerms}
                    onChange={(e) => update({ paymentTerms: e.target.value })}
                    className="min-h-[50px] resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Accent colour */}
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                Accent Colour
              </h3>
              <div className="flex flex-wrap gap-2">
                {accentColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => update({ accentColor: color })}
                    className={`size-8 rounded-lg transition-all cursor-pointer border-2 ${
                      data.accentColor === color
                        ? "border-foreground scale-110 shadow-md"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ background: color }}
                  />
                ))}
                <label className="size-8 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/30 transition-colors overflow-hidden">
                  <span className="text-[10px] text-muted-foreground">+</span>
                  <input
                    type="color"
                    value={data.accentColor}
                    onChange={(e) => update({ accentColor: e.target.value })}
                    className="absolute opacity-0 w-0 h-0"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right sidebar — Live mini preview + totals */}
          <div className="space-y-5">
            {/* Totals card */}
            <div className="rounded-2xl border-2 p-6 space-y-3 sticky top-20" style={{ borderColor: data.accentColor + "30" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-medium">{fmtMoney(subtotal, sym)}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Discount ({data.discount}%)</span>
                  <span className="text-sm font-medium text-green-600">-{fmtMoney(discountAmt, sym)}</span>
                </div>
              )}
              {data.taxRate > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tax ({data.taxRate}%)</span>
                  <span className="text-sm font-medium">{fmtMoney(tax, sym)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: data.accentColor }}>
                    Total Due
                  </span>
                  <span className="text-2xl font-extrabold" style={{ color: data.accentColor }}>
                    {fmtMoney(total, sym)}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {data.items.length} item{data.items.length !== 1 ? "s" : ""} • {data.currency}
              </Badge>
            </div>

            {/* Mini live preview */}
            <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Live Preview
              </p>
              <div className="transform scale-[0.48] origin-top-left w-[208%] pointer-events-none">
                <InvoicePreview data={data} sym={sym} />
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
