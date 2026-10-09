// Renders schema.org JSON-LD. "<" is escaped so text coming from data
// (names, descriptions) can never close the <script> tag early.
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
