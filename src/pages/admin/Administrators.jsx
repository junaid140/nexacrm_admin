import useCrm from "../../hooks/useCrm.js";
import RecordsPage from "../../components/admin/records/RecordsPage.jsx";
export default function Administrators() {
  const state = useCrm();
  return <RecordsPage {...state} />;
}
