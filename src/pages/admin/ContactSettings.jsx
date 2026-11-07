import WhatsAppIcon from "../../components/global/WhatsAppIcon.jsx";
import { useEffect, useRef, useState } from "react";
import { api } from "../../configs/api.js";
import PageHead from "../../components/global/PageHead.jsx";
import Card from "../../components/global/Card.jsx";
import Field from "../../components/global/FormInput.jsx";
import Button from "../../components/global/Button.jsx";
import DataLoader from "../../components/global/DataLoader.jsx";
export default function ContactSettings() {
  const [values, setValues] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    api("contact-settings")
      .then((data) => {
        if (active) setValues(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function save(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await api("contact-settings", { method: "PUT", body: values });
      setValues(data);
      setNotice("Contact details saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead title="Contact details" />
      {error && (
        <p role="alert" className="mb-5 text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-5 text-brand-700">
          {notice}
        </p>
      )}
      {!values ? (
        !error && <DataLoader />
      ) : (
        <Card title="WhatsApp & calling numbers">
          <form className="max-w-3xl p-5" onSubmit={save}>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              These numbers appear on the public free-trial signup page and in the CRM
              Contact menu for Admins and Managers. Enter international numbers without
              spaces. Leave a field empty to hide that contact method.
            </p>
            <div className="grid gap-x-5 sm:grid-cols-2">
              {[
                ["whatsappNumber", "WhatsApp contact number"],
                ["callingNumber", "Calling number"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={
                    key === "whatsappNumber" ? (
                      <span className="inline-flex items-center gap-2">
                        <WhatsAppIcon size={18} />
                        {label}
                      </span>
                    ) : (
                      label
                    )
                  }
                  hint="Example: +923001234567"
                >
                  <input
                    type="tel"
                    autoComplete="tel"
                    maxLength={16}
                    pattern="[+][1-9][0-9]{6,14}"
                    placeholder="+923001234567"
                    value={values[key]}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [key]: event.target.value }))
                    }
                  />
                </Field>
              ))}
            </div>
            <Button type="submit" loading={busy}>
              Save contact details
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
