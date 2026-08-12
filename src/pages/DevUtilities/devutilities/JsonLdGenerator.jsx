import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const SCHEMA_TYPES = [
  { key: "LocalBusiness", label: "Local Business" },
  { key: "Article", label: "Article / Blog Post" },
  { key: "Product", label: "Product" },
  { key: "FAQPage", label: "FAQ Page" },
  { key: "BreadcrumbList", label: "Breadcrumb List" },
];

const EMPTY = {
  LocalBusiness: {
    name: "",
    description: "",
    street: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    latitude: "",
    longitude: "",
    phone: "",
    hours: "",
  },
  Article: {
    headline: "",
    authorName: "",
    publisherName: "",
    imageUrl: "",
    datePublished: "",
  },
  Product: {
    name: "",
    description: "",
    brand: "",
    sku: "",
    price: "",
    currency: "USD",
    availability: "InStock",
    ratingValue: "",
    reviewCount: "",
  },
  FAQPage: {
    faqs: [{ question: "", answer: "" }],
  },
  BreadcrumbList: {
    crumbs: [{ name: "", url: "" }],
  },
};

export default function JsonLdGenerator() {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-250/90 shadow-sm",
      headerBorder: "border-zinc-200",
      input:
        "bg-white border-zinc-250 text-zinc-900 focus:border-zinc-900 placeholder-zinc-400 focus:bg-white",
      select:
        "bg-white border-zinc-250 text-zinc-900 focus:border-zinc-900",
      buttonPrimary:
        "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
      buttonSecondary:
        "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]",
      buttonActive: "bg-zinc-900 text-white border-zinc-900",
      buttonDanger:
        "bg-white border-zinc-250 text-red-600 hover:bg-red-50 active:scale-[0.98]",
      label: "text-zinc-500",
      outputTextarea:
        "bg-[#F9FAFB] border-zinc-200 text-emerald-700 focus:border-zinc-300",
      sectionBorder: "border-zinc-200",
      itemCard: "bg-zinc-50 border-zinc-200",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
      headerBorder: "border-zinc-800/85",
      input:
        "bg-zinc-950/60 border-zinc-800 text-white focus:border-zinc-500 placeholder-zinc-600 focus:bg-zinc-950",
      select: "bg-zinc-950/60 border-zinc-800 text-white focus:border-zinc-500",
      buttonPrimary:
        "bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98]",
      buttonSecondary:
        "bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:bg-zinc-850 active:scale-[0.98]",
      buttonActive: "bg-white text-zinc-950 border-white",
      buttonDanger:
        "bg-zinc-900 border-zinc-800/80 text-red-400 hover:bg-red-950/40 active:scale-[0.98]",
      label: "text-zinc-400",
      outputTextarea:
        "bg-zinc-950/80 border-zinc-800/80 text-emerald-400 focus:border-zinc-700",
      sectionBorder: "border-zinc-800/60",
      itemCard: "bg-zinc-950/40 border-zinc-800/70",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const [schemaType, setSchemaType] = useState("LocalBusiness");
  const [data, setData] = useState(EMPTY);

  const current = data[schemaType];

  const setField = useCallback(
    (field, value) => {
      setData((prev) => ({
        ...prev,
        [schemaType]: { ...prev[schemaType], [field]: value },
      }));
    },
    [schemaType],
  );

  // FAQ helpers
  const setFaq = (idx, field, value) => {
    setData((prev) => {
      const faqs = prev.FAQPage.faqs.map((f, i) =>
        i === idx ? { ...f, [field]: value } : f,
      );
      return { ...prev, FAQPage: { faqs } };
    });
  };
  const addFaq = () =>
    setData((prev) => ({
      ...prev,
      FAQPage: { faqs: [...prev.FAQPage.faqs, { question: "", answer: "" }] },
    }));
  const removeFaq = (idx) =>
    setData((prev) => ({
      ...prev,
      FAQPage: { faqs: prev.FAQPage.faqs.filter((_, i) => i !== idx) },
    }));

  // Breadcrumb helpers
  const setCrumb = (idx, field, value) => {
    setData((prev) => {
      const crumbs = prev.BreadcrumbList.crumbs.map((c, i) =>
        i === idx ? { ...c, [field]: value } : c,
      );
      return { ...prev, BreadcrumbList: { crumbs } };
    });
  };
  const addCrumb = () =>
    setData((prev) => ({
      ...prev,
      BreadcrumbList: {
        crumbs: [...prev.BreadcrumbList.crumbs, { name: "", url: "" }],
      },
    }));
  const removeCrumb = (idx) =>
    setData((prev) => ({
      ...prev,
      BreadcrumbList: {
        crumbs: prev.BreadcrumbList.crumbs.filter((_, i) => i !== idx),
      },
    }));

  // Build the schema.org object, omitting empty fields
  const schemaObject = useMemo(() => {
    const base = { "@context": "https://schema.org" };

    if (schemaType === "LocalBusiness") {
      const d = data.LocalBusiness;
      const obj = { ...base, "@type": "LocalBusiness" };
      if (d.name) obj.name = d.name;
      if (d.description) obj.description = d.description;

      const address = {};
      if (d.street) address.streetAddress = d.street;
      if (d.city) address.addressLocality = d.city;
      if (d.region) address.addressRegion = d.region;
      if (d.postalCode) address.postalCode = d.postalCode;
      if (d.country) address.addressCountry = d.country;
      if (Object.keys(address).length) {
        obj.address = { "@type": "PostalAddress", ...address };
      }

      if (d.latitude || d.longitude) {
        obj.geo = {
          "@type": "GeoCoordinates",
          ...(d.latitude ? { latitude: d.latitude } : {}),
          ...(d.longitude ? { longitude: d.longitude } : {}),
        };
      }
      if (d.phone) obj.telephone = d.phone;
      if (d.hours) obj.openingHours = d.hours;
      return obj;
    }

    if (schemaType === "Article") {
      const d = data.Article;
      const obj = { ...base, "@type": "Article" };
      if (d.headline) obj.headline = d.headline;
      if (d.imageUrl) obj.image = [d.imageUrl];
      if (d.authorName)
        obj.author = { "@type": "Person", name: d.authorName };
      if (d.publisherName)
        obj.publisher = { "@type": "Organization", name: d.publisherName };
      if (d.datePublished) obj.datePublished = d.datePublished;
      return obj;
    }

    if (schemaType === "Product") {
      const d = data.Product;
      const obj = { ...base, "@type": "Product" };
      if (d.name) obj.name = d.name;
      if (d.description) obj.description = d.description;
      if (d.brand) obj.brand = { "@type": "Brand", name: d.brand };
      if (d.sku) obj.sku = d.sku;
      if (d.price) {
        obj.offers = {
          "@type": "Offer",
          price: d.price,
          priceCurrency: d.currency,
          availability: `https://schema.org/${d.availability}`,
        };
      }
      if (d.ratingValue) {
        obj.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: d.ratingValue,
          ...(d.reviewCount ? { reviewCount: d.reviewCount } : {}),
        };
      }
      return obj;
    }

    if (schemaType === "FAQPage") {
      const d = data.FAQPage;
      const items = d.faqs
        .filter((f) => f.question || f.answer)
        .map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        }));
      return { ...base, "@type": "FAQPage", mainEntity: items };
    }

    if (schemaType === "BreadcrumbList") {
      const d = data.BreadcrumbList;
      const items = d.crumbs
        .filter((c) => c.name || c.url)
        .map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          ...(c.url ? { item: c.url } : {}),
        }));
      return { ...base, "@type": "BreadcrumbList", itemListElement: items };
    }

    return base;
  }, [schemaType, data]);

  const jsonString = useMemo(
    () => JSON.stringify(schemaObject, null, 2),
    [schemaObject],
  );

  const scriptBlock = useMemo(
    () =>
      `<script type="application/ld+json">\n${jsonString}\n</script>`,
    [jsonString],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(scriptBlock);
      toast.success("JSON-LD script copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [scriptBlock]);

  const handleValidate = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(scriptBlock);
      toast.success("Copied — opening Google Rich Results Test");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
    window.open(
      "https://search.google.com/test/rich-results",
      "_blank",
      "noopener,noreferrer",
    );
  }, [scriptBlock]);

  const clearAll = () => setData(EMPTY);

  const loadSample = () => {
    if (schemaType === "LocalBusiness") {
      setData((prev) => ({
        ...prev,
        LocalBusiness: {
          name: "Bytes & Brews Cafe",
          description: "A cozy developer-friendly coffee shop with fast Wi-Fi.",
          street: "42 Compiler Lane",
          city: "San Francisco",
          region: "CA",
          postalCode: "94103",
          country: "US",
          latitude: "37.7749",
          longitude: "-122.4194",
          phone: "+1-415-555-0142",
          hours: "Mo-Fr 07:00-19:00",
        },
      }));
    } else if (schemaType === "Article") {
      setData((prev) => ({
        ...prev,
        Article: {
          headline: "Understanding Structured Data for SEO",
          authorName: "Jane Developer",
          publisherName: "DevTasks",
          imageUrl: "https://example.com/article-cover.png",
          datePublished: "2026-01-15",
        },
      }));
    } else if (schemaType === "Product") {
      setData((prev) => ({
        ...prev,
        Product: {
          name: "Mechanical Keyboard Pro",
          description: "A hot-swappable 75% mechanical keyboard for coders.",
          brand: "KeyForge",
          sku: "KF-75-PRO",
          price: "129.99",
          currency: "USD",
          availability: "InStock",
          ratingValue: "4.7",
          reviewCount: "218",
        },
      }));
    } else if (schemaType === "FAQPage") {
      setData((prev) => ({
        ...prev,
        FAQPage: {
          faqs: [
            {
              question: "What is JSON-LD?",
              answer:
                "JSON-LD is a lightweight format for embedding structured data using schema.org vocabulary.",
            },
            {
              question: "Does it run offline?",
              answer: "Yes, this generator runs entirely in your browser.",
            },
          ],
        },
      }));
    } else if (schemaType === "BreadcrumbList") {
      setData((prev) => ({
        ...prev,
        BreadcrumbList: {
          crumbs: [
            { name: "Home", url: "https://example.com" },
            { name: "Blog", url: "https://example.com/blog" },
            { name: "Structured Data", url: "https://example.com/blog/schema" },
          ],
        },
      }));
    }
  };

  const inputCls = `w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 ${t.input}`;
  const selectCls = `w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 appearance-none cursor-pointer ${t.select}`;
  const labelCls = `text-[10px] font-black uppercase tracking-widest ${t.label}`;

  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 py-8 flex items-start justify-center transition-colors duration-300 ${t.wrapper}`}
    >
      <div
        className={`w-full max-w-7xl rounded-3xl border overflow-hidden transition-all duration-300 ${t.card}`}
      >
        <div className={`flex items-center gap-4 p-5 border-b ${t.headerBorder}`}>
          <Link
            to="/devutilities"
            className={`w-10 h-10 border rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${t.buttonSecondary}`}
            title="Back to Utilities"
          >
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black uppercase tracking-tight">
              JSON-LD Schema Generator
            </h1>
            <p className={`text-xs font-semibold mt-0.5 ${t.label}`}>
              Build structured schema.org metadata markup entirely offline.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadSample}
              className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
            >
              Load Sample
            </button>
            <button
              onClick={clearAll}
              className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* ---------------- FORM BUILDER ---------------- */}
          <div className={`p-6 flex flex-col gap-6 lg:border-r ${t.sectionBorder}`}>
            <div className="flex flex-col gap-4">
              <h2
                className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b ${t.sectionBorder}`}
              >
                Schema Type
              </h2>
              <Field label="Select Schema">
                <select
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value)}
                  className={selectCls}
                >
                  {SCHEMA_TYPES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex flex-col gap-4">
              <h2
                className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b ${t.sectionBorder}`}
              >
                Details
              </h2>

              {/* Local Business */}
              {schemaType === "LocalBusiness" && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <Field label="Business Name">
                    <input
                      className={inputCls}
                      value={current.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="e.g. Bytes & Brews Cafe"
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      rows={2}
                      className={`${inputCls} resize-none`}
                      value={current.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Short summary of the business…"
                    />
                  </Field>
                  <Field label="Street Address">
                    <input
                      className={inputCls}
                      value={current.street}
                      onChange={(e) => setField("street", e.target.value)}
                      placeholder="42 Compiler Lane"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City">
                      <input
                        className={inputCls}
                        value={current.city}
                        onChange={(e) => setField("city", e.target.value)}
                        placeholder="San Francisco"
                      />
                    </Field>
                    <Field label="Region / State">
                      <input
                        className={inputCls}
                        value={current.region}
                        onChange={(e) => setField("region", e.target.value)}
                        placeholder="CA"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Postal Code">
                      <input
                        className={inputCls}
                        value={current.postalCode}
                        onChange={(e) => setField("postalCode", e.target.value)}
                        placeholder="94103"
                      />
                    </Field>
                    <Field label="Country">
                      <input
                        className={inputCls}
                        value={current.country}
                        onChange={(e) => setField("country", e.target.value)}
                        placeholder="US"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Latitude">
                      <input
                        className={inputCls}
                        value={current.latitude}
                        onChange={(e) => setField("latitude", e.target.value)}
                        placeholder="37.7749"
                      />
                    </Field>
                    <Field label="Longitude">
                      <input
                        className={inputCls}
                        value={current.longitude}
                        onChange={(e) => setField("longitude", e.target.value)}
                        placeholder="-122.4194"
                      />
                    </Field>
                  </div>
                  <Field label="Phone Number">
                    <input
                      className={inputCls}
                      value={current.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+1-415-555-0142"
                    />
                  </Field>
                  <Field label="Hours of Operation">
                    <input
                      className={inputCls}
                      value={current.hours}
                      onChange={(e) => setField("hours", e.target.value)}
                      placeholder="Mo-Fr 07:00-19:00"
                    />
                  </Field>
                </div>
              )}

              {/* Article */}
              {schemaType === "Article" && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <Field label="Headline">
                    <input
                      className={inputCls}
                      value={current.headline}
                      onChange={(e) => setField("headline", e.target.value)}
                      placeholder="Understanding Structured Data for SEO"
                    />
                  </Field>
                  <Field label="Author Name">
                    <input
                      className={inputCls}
                      value={current.authorName}
                      onChange={(e) => setField("authorName", e.target.value)}
                      placeholder="Jane Developer"
                    />
                  </Field>
                  <Field label="Publisher Name">
                    <input
                      className={inputCls}
                      value={current.publisherName}
                      onChange={(e) => setField("publisherName", e.target.value)}
                      placeholder="DevTasks"
                    />
                  </Field>
                  <Field label="Feature Image URL">
                    <input
                      className={inputCls}
                      value={current.imageUrl}
                      onChange={(e) => setField("imageUrl", e.target.value)}
                      placeholder="https://example.com/cover.png"
                    />
                  </Field>
                  <Field label="Date Published">
                    <input
                      type="date"
                      className={inputCls}
                      value={current.datePublished}
                      onChange={(e) =>
                        setField("datePublished", e.target.value)
                      }
                    />
                  </Field>
                </div>
              )}

              {/* Product */}
              {schemaType === "Product" && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <Field label="Product Name">
                    <input
                      className={inputCls}
                      value={current.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="Mechanical Keyboard Pro"
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      rows={2}
                      className={`${inputCls} resize-none`}
                      value={current.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Short product description…"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Brand">
                      <input
                        className={inputCls}
                        value={current.brand}
                        onChange={(e) => setField("brand", e.target.value)}
                        placeholder="KeyForge"
                      />
                    </Field>
                    <Field label="SKU">
                      <input
                        className={inputCls}
                        value={current.sku}
                        onChange={(e) => setField("sku", e.target.value)}
                        placeholder="KF-75-PRO"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Price">
                      <input
                        className={inputCls}
                        value={current.price}
                        onChange={(e) => setField("price", e.target.value)}
                        placeholder="129.99"
                      />
                    </Field>
                    <Field label="Currency">
                      <input
                        className={inputCls}
                        value={current.currency}
                        onChange={(e) => setField("currency", e.target.value)}
                        placeholder="USD"
                      />
                    </Field>
                  </div>
                  <Field label="Availability">
                    <select
                      className={selectCls}
                      value={current.availability}
                      onChange={(e) => setField("availability", e.target.value)}
                    >
                      <option value="InStock">In Stock</option>
                      <option value="OutOfStock">Out of Stock</option>
                      <option value="PreOrder">Pre-Order</option>
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Rating (0-5)">
                      <input
                        className={inputCls}
                        value={current.ratingValue}
                        onChange={(e) => setField("ratingValue", e.target.value)}
                        placeholder="4.7"
                      />
                    </Field>
                    <Field label="Review Count">
                      <input
                        className={inputCls}
                        value={current.reviewCount}
                        onChange={(e) => setField("reviewCount", e.target.value)}
                        placeholder="218"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* FAQ Page */}
              {schemaType === "FAQPage" && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                  {current.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-3 rounded-xl border p-3 ${t.itemCard}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={labelCls}>Q&A #{idx + 1}</span>
                        {current.faqs.length > 1 && (
                          <button
                            onClick={() => removeFaq(idx)}
                            className={`px-2.5 py-1 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonDanger}`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        className={inputCls}
                        value={faq.question}
                        onChange={(e) => setFaq(idx, "question", e.target.value)}
                        placeholder="Question"
                      />
                      <textarea
                        rows={2}
                        className={`${inputCls} resize-none`}
                        value={faq.answer}
                        onChange={(e) => setFaq(idx, "answer", e.target.value)}
                        placeholder="Answer"
                      />
                    </div>
                  ))}
                  <button
                    onClick={addFaq}
                    className={`px-3 py-2 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                  >
                    + Add Question
                  </button>
                </div>
              )}

              {/* Breadcrumb List */}
              {schemaType === "BreadcrumbList" && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                  {current.crumbs.map((crumb, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-3 rounded-xl border p-3 ${t.itemCard}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={labelCls}>Step #{idx + 1}</span>
                        {current.crumbs.length > 1 && (
                          <button
                            onClick={() => removeCrumb(idx)}
                            className={`px-2.5 py-1 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonDanger}`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        className={inputCls}
                        value={crumb.name}
                        onChange={(e) => setCrumb(idx, "name", e.target.value)}
                        placeholder="Page name (e.g. Blog)"
                      />
                      <input
                        className={inputCls}
                        value={crumb.url}
                        onChange={(e) => setCrumb(idx, "url", e.target.value)}
                        placeholder="https://example.com/blog"
                      />
                    </div>
                  ))}
                  <button
                    onClick={addCrumb}
                    className={`px-3 py-2 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                  >
                    + Add Crumb
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ---------------- OUTPUT ---------------- */}
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-4 flex-1">
              <div
                className={`flex items-center justify-between pb-2 border-b ${t.sectionBorder}`}
              >
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">
                  Generated JSON-LD
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleValidate}
                    className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                  >
                    Validate
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonPrimary}`}
                  >
                    Copy Script
                  </button>
                </div>
              </div>
              <div className="relative flex-1 flex flex-col min-h-[420px]">
                <textarea
                  readOnly
                  value={scriptBlock}
                  spellCheck={false}
                  className={`w-full flex-1 rounded-2xl p-4 font-mono text-xs leading-relaxed resize-none outline-none border transition-colors duration-200 ${t.outputTextarea}`}
                />
              </div>
              <p className={`text-[10px] font-semibold ${t.label}`}>
                Paste this inside the &lt;head&gt; of your page. Validate opens
                Google&apos;s Rich Results Test with the code copied to your
                clipboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}