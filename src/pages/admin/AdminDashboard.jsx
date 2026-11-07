import useCrm from "../../hooks/useCrm.js";
import PageToolbar from "../../components/admin/PageToolbar.jsx";
import ReportOverview from "../../components/admin/reports/ReportOverview.jsx";
export default function AdminDashboard() {
  const state = useCrm();
  return (
    <>
      <PageToolbar {...state} />
      <ReportOverview {...state} />
    </>
  );
}
