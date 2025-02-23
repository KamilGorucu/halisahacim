import ReCAPTCHA from "react-google-recaptcha";

const Recaptcha = ({ onVerify }) => {
  const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error("reCAPTCHA site key bulunamadı! Lütfen .env dosyanızı kontrol edin.");
    return <p style={{ color: 'red' }}>reCAPTCHA yapılandırması eksik!</p>;
  }

  return (
    <ReCAPTCHA
      sitekey={siteKey}
      onChange={onVerify}
    />
  );
};

export default Recaptcha;
