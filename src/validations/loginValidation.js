import * as Yup from "yup";
export const loginValidation = Yup.object({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  password: Yup.string()
    .min(4, "Enter at least 4 characters")
    .required("Password is required"),
});
