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
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const RegisterinitialValues = {
  lastName: "",
  firstName: "",
  email: "",
  password: "",
};

export const VerifyValidationSchema = Yup.object({
  token: Yup.string()
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^[0-9]+$/, "OTP must contain only numbers")
    .required("OTP is required"),
});

export const VerifyinitialValues = {
  token: "",
};
