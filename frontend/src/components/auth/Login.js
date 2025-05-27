import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo300.png";
import "../../styles/Auth.css";
import axios from "axios";
import Cookies from "universal-cookie";
const cookies = new Cookies();

function Login() {
  const [sicilNo, setSicilNo] = useState("");
  const [sifre, setSifre] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = cookies.get("TOKEN");
    if (token) {
      // Token'ın geçerliliğini backend'e sorarak kontrol et
      axios({
        method: "POST",
        url: "/api/users/validate-token",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((result) => {
          if (result.data.valid) {
            navigate("/");
          } else {
            // Token geçersizse cookie'yi temizle
            cookies.remove("TOKEN", { path: "/" });
          }
        })
        .catch(() => {
          // Hata durumunda da cookie'yi temizle
          cookies.remove("TOKEN", { path: "/" });
        });
    }
  }, [navigate]);

  const configuration = {
    method: "POST",
    url: "/api/users/login",
    data: {
      registrationNumber: sicilNo,
      password: sifre,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  const validateForm = () => {
    // Sicil numarasını kontrol et
    let processedSicilNo = sicilNo.trim().replace(/\s+/g, "");

    // "ab" ile başlıyorsa kaldır
    if (processedSicilNo.toLowerCase().startsWith("ab")) {
      processedSicilNo = processedSicilNo.substring(2);
    }

    // Sayısal değer ve uzunluk kontrolü (4-9 hane)
    const sicilNoNumeric = /^\d{4,9}$/.test(processedSicilNo);

    if (!sicilNoNumeric) {
      setError(true);
      setErrorMessage("Sicil numarası 4-9 haneli sayı olmalıdır");
      return false;
    }

    if (sifre === "") {
      setError(true);
      setErrorMessage("Şifre alanını doldurunuz");
      return false;
    }

    return true;
  };

  const login = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Sicil numarasını işle
    let processedSicilNo = sicilNo.trim().replace(/\s+/g, "");

    // "ab" ile başlıyorsa kaldır
    if (processedSicilNo.toLowerCase().startsWith("ab")) {
      processedSicilNo = processedSicilNo.substring(2);
    }

    // Sayısal değere dönüştür
    const numericSicilNo = parseInt(processedSicilNo, 10);

    // İsteği yapılandır
    const loginConfig = {
      ...configuration,
      data: {
        registrationNumber: numericSicilNo,
        password: sifre.trim(),
      },
    };

    axios(loginConfig)
      .then((result) => {
        // status code 200 ise başarılı giriş
        if (result.status !== 200) {
          setError(true);
          setErrorMessage("Hata! Daha sonra tekrar deneyiniz");
          setLoading(false);
          return;
        }

        if (rememberMe) {
          // Beni hatırla seçiliyse token 24 saat geçerli olacak
          const expDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat sonra geçerli olacak
          cookies.set("TOKEN", result.data.token, {
            path: "/",
            expires: expDate,
          });
        } else {
          // Beni hatırla seçili değilse, token oturum süresince geçerli olacak
          cookies.set("TOKEN", result.data.token, {
            path: "/",
          });
        }
        // Başarılı giriş sonrası yönlendirme
        window.location.href = "/";
      })
      .catch((error) => {
        const message =
          error.response?.data?.message || "Hata! Daha sonra tekrar deneyiniz";
        setError(true);
        setErrorMessage(message);
        setSifre(""); // Şifreyi temizle
        setLoading(false);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    login();
  };

  return (
    <Container className="my-5">
      <Card className="login-card">
        <Row className="g-0">
          <Col md="6" className="d-flex align-items-center">
            <CardBody className="p-4 p-lg-5">
              <div className="text-center mb-4">
                <div
                  onClick={() => navigate("/")}
                  style={{ cursor: "pointer" }}
                  className="mb-4"
                >
                  <img
                    src={logo}
                    alt="logo"
                    className="img-fluid logo-animation"
                    style={{ maxWidth: "200px" }}
                  />
                </div>
                <h3 className="fw-bold mb-4" style={{ color: "#d32f2f" }}>
                  Giriş Yap
                </h3>
              </div>

              <Form onSubmit={handleSubmit}>
                <FormGroup className="form-outline mb-4">
                  <Label for="sicilNo">Sicil Numarası</Label>
                  <Input
                    id="sicilNo"
                    onChange={(e) => {
                      setSicilNo(e.target.value);
                      setError(false);
                      setErrorMessage("");
                    }}
                    value={sicilNo}
                    type="text"
                    autoComplete="username"
                    placeholder="Örn: ab123456 veya 123456"
                  />
                  <small className="text-muted">
                    4-9 haneli sayı, "ab" öneki kullanılabilir
                  </small>

                  <div className="password-input position-relative">
                    <Label for="sifre">Şifre</Label>
                    <Input
                      id="sifre"
                      onChange={(e) => {
                        setSifre(e.target.value);
                        setError(false);
                        setErrorMessage("");
                      }}
                      value={sifre}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="d-flex justify-content-between mb-4">
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="checkbox"
                          id="rememberMe"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                        />
                        Beni Hatırla
                      </Label>
                    </FormGroup>
                  </div>

                  {error && (
                    <Alert color="danger" className="mb-4 text-center fade-in">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {errorMessage}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    onClick={login}
                    className="mb-4 w-100 btn-login"
                    color="danger"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Giriş Yapılıyor...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Giriş Yap
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Hesabınız yok mu?{" "}
                      <a href="/register" className="text-danger fw-bold">
                        Kayıt Olun
                      </a>
                    </p>
                  </div>
                </FormGroup>
              </Form>
            </CardBody>
          </Col>

          <Col
            md="6"
            className="system-info text-white d-flex align-items-center"
          >
            <div className="px-4 py-5 p-md-5">
              <h3 className="fw-bold mb-4">Adliye Yönetim Sistemi</h3>
              <p className="mb-4">
                Adliye Yönetim Sistemi uygulaması sayesinde
              </p>
            </div>
          </Col>
        </Row>
      </Card>
      <p className="text-center text-muted mt-4">Developed by Bilgehan Kalay</p>
    </Container>
  );
}

export default Login;
