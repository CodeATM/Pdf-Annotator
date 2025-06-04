import * as Yup from "yup";

export const LoginValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const LogininitialValues = {
  email: "",
  password: "",
};

export const RegisterValidationSchema = Yup.object({
  lastname: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  firstname: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const RegisterinitialValues = {
  email: "",
  password: "",
};
