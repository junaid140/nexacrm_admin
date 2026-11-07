import RecordFilters from "./RecordFilters.jsx";
import PageToolbar from "../PageToolbar.jsx";
import RecordsTable from "./RecordsTable.jsx";
import RecordForm from "./RecordForm.jsx";
import RecordActionForm from "./RecordActionForm.jsx";
export default function RecordsPage(state) {
  return (
    <>
      <PageToolbar {...state} />
      <RecordFilters {...state} />
      <RecordsTable {...state} />
      {state.editing && <RecordForm {...state} />}
      {state.action && <RecordActionForm {...state} />}
    </>
  );
}
