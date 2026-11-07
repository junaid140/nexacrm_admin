import { Plus, Download } from "lucide-react";
import Button from "../global/Button.jsx";
import PageHead from "../global/PageHead.jsx";
export default function PageToolbar({
  user,
  section,
  config,
  setAction,
  openEditor,
  exportReport,
  error,
  notice,
  setNotice,
}) {
  return (
    <>
      <PageHead title={config.title}>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {section === "clients" && user?.role !== "Sales Agent" && (
            <Button
              variant="secondary"
              onClick={() => {
                setAction({ name: "import", row: {}, organizationId: "" });
              }}
            >
              Import existing CRM
            </Button>
          )}
          {config.fields && (
            <Button
              variant="primary"
              className="bg-brand-900 text-white"
              onClick={() => openEditor()}
            >
              <Plus size={16} />
              {config.createLabel}
            </Button>
          )}
          {section === "reports" && (
            <Button variant="secondary" onClick={exportReport}>
              <Download size={16} />
              Export revenue
            </Button>
          )}
        </div>
      </PageHead>
      {error && (
        <div
          className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
          role="status"
        >
          {notice}
          <Button variant="secondary" onClick={() => setNotice("")}>
            Dismiss
          </Button>
        </div>
      )}
    </>
  );
}
