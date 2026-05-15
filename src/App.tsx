import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HomePage } from "./pages/HomePage";
import { JsonFormatter } from "./pages/tools/JsonFormatter";
import { Base64Tool } from "./pages/tools/Base64Tool";
import { UrlEncoder } from "./pages/tools/UrlEncoder";
import { WordCounter } from "./pages/tools/WordCounter";
import { LoremIpsum } from "./pages/tools/LoremIpsum";
import { ColourConverter } from "./pages/tools/ColourConverter";
import { CaseConverter } from "./pages/tools/CaseConverter";
import { MarkdownToHtml } from "./pages/tools/MarkdownToHtml";
import { PasswordGenerator } from "./pages/tools/PasswordGenerator";
import { UuidGenerator } from "./pages/tools/UuidGenerator";
import { TimestampConverter } from "./pages/tools/TimestampConverter";
import { CssMinifier } from "./pages/tools/CssMinifier";
import { HtmlEntities } from "./pages/tools/HtmlEntities";
import { QrCodeGenerator } from "./pages/tools/QrCodeGenerator";
import { HashGenerator } from "./pages/tools/HashGenerator";
import { ImageResizer } from "./pages/tools/ImageResizer";
import { InstaFontGenerator } from "./pages/tools/InstaFontGenerator";
import { MortgageCalculator } from "./pages/tools/MortgageCalculator";
import { InvoiceGenerator } from "./pages/tools/InvoiceGenerator";
import { ColourPaletteGenerator } from "./pages/tools/ColourPaletteGenerator";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" switchable>
        <Toaster />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools/json-formatter" element={<JsonFormatter />} />
          <Route path="/tools/base64" element={<Base64Tool />} />
          <Route path="/tools/url-encoder" element={<UrlEncoder />} />
          <Route path="/tools/word-counter" element={<WordCounter />} />
          <Route path="/tools/lorem-ipsum" element={<LoremIpsum />} />
          <Route path="/tools/colour-converter" element={<ColourConverter />} />
          <Route path="/tools/case-converter" element={<CaseConverter />} />
          <Route path="/tools/markdown-to-html" element={<MarkdownToHtml />} />
          <Route path="/tools/password-generator" element={<PasswordGenerator />} />
          <Route path="/tools/uuid-generator" element={<UuidGenerator />} />
          <Route path="/tools/timestamp-converter" element={<TimestampConverter />} />
          <Route path="/tools/css-minifier" element={<CssMinifier />} />
          <Route path="/tools/html-entities" element={<HtmlEntities />} />
          <Route path="/tools/qr-code" element={<QrCodeGenerator />} />
          <Route path="/tools/hash-generator" element={<HashGenerator />} />
          <Route path="/tools/image-resizer" element={<ImageResizer />} />
          <Route path="/tools/instagram-fonts" element={<InstaFontGenerator />} />
          <Route path="/tools/mortgage-calculator" element={<MortgageCalculator />} />
          <Route path="/tools/invoice-generator" element={<InvoiceGenerator />} />
          <Route path="/tools/colour-palette" element={<ColourPaletteGenerator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
