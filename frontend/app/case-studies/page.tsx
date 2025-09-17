export const metadata = {
  title: 'Okapiq Case Studies',
  description: 'Selected customer outcomes powered by Okapiq',
};

export default function CaseStudiesPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Okapiq Case Studies</h1>
      <p className="mt-2 text-gray-600">Real outcomes achieved with our market intelligence and automation stack.</p>

      <div className="mt-10 space-y-6">
        {/* Search Fund Success */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow px-6 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Search Fund Success</h2>
          <p className="mt-2 text-gray-700">We increased lead aggregation speed by 4x, resulting in 50% of the client's leads being more qualified.</p>
          <div className="mt-3 inline-flex items-center text-emerald-700 font-semibold text-sm">4x faster lead generation</div>
        </section>

        {/* Landscaping Company Growth */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow px-6 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Landscaping Company Growth</h2>
          <p className="mt-2 text-gray-700">Automated marketing increased SEO by 238% and lead generation 4x, resulting in $400K and $1.2M revenue increases.</p>
          <div className="mt-3 inline-flex items-center text-emerald-700 font-semibold text-sm">238% SEO improvement</div>
        </section>

        {/* Deal Closing Success */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow px-6 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Deal Closing Success</h2>
          <p className="mt-2 text-gray-700">Scraped 100,000+ contacts, resulting in $120K in earned revenue. Okapiq earned $4,000 through boosting seller response rates by 70%.</p>
          <div className="mt-3 inline-flex items-center text-emerald-700 font-semibold text-sm">70% higher response rates</div>
        </section>
      </div>
    </main>
  );
}


