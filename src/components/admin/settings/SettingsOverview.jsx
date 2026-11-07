import Card from "../../global/Card.jsx";
export default function SettingsOverview({ user }) {
  return (
    <Card className="p-5 [&_dl]:my-5 [&_dl]:grid [&_dl]:gap-3 sm:[&_dl]:grid-cols-2 [&_dt]:text-sm [&_dt]:text-gray-500 [&_dd]:text-sm [&_dd]:font-medium">
      <h2>Platform configuration</h2>
      <dl>
        <dt>Signed in as</dt>
        <dd>{user?.email}</dd>
        <dt>Authentication</dt>
        <dd>Separate SaaS administrator account and Bearer session</dd>
        <dt>Payments</dt>
        <dd>Manual invoices and verified payment references</dd>
        <dt>Database</dt>
        <dd>Connected through the shared CRM server</dd>
        <dt>Client login</dt>
        <dd>CRM sign in with the client Company ID</dd>
      </dl>
      <p>
        Private SMTP and Meta secrets remain in the CRM server configuration. System
        configuration records are an administrative registry.
      </p>
    </Card>
  );
}
