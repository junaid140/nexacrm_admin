import useCrm from "../../hooks/useCrm.js";
import PageToolbar from "../../components/admin/PageToolbar.jsx";
import SettingsOverview from "../../components/admin/settings/SettingsOverview.jsx";
export default function Settings() {
  const state = useCrm();
  return (
    <>
      <PageToolbar {...state} />
      <SettingsOverview {...state} />
    </>
  );
}
