import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Registro"
        description="Esta es la página de registro para Compras Energia PD"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
