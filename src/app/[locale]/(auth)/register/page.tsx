import RegisterForm from '@/components/auth/RegisterForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  return <RegisterForm locale={locale} />;
}
