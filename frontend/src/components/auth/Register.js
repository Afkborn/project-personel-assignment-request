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
  FormFeedback,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo300.png";
import "../../styles/Auth.css";
import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export default function Register() {
  // Form state
  const [formData, setFormData] = useState({
    sicilNo: "",
    ad: "",
    soyad: "",
    password: "",
    passwordConfirm: "",
    email: "",
    telefon: "",
    tckn: "",
    dogumTarihi: "",
    dogumYeri: "",
    kanGrubu: "",
    keyboard: "",
    meslekBaslangic: "",
    adliye: 0,
    birim: "",
  });

  // State için kısaltma
  const {
    sicilNo,
    ad,
    soyad,
    password,
    passwordConfirm,
    email,
    telefon,
    tckn,
    dogumTarihi,
    dogumYeri,
    kanGrubu,
    keyboard,
    meslekBaslangic,
    adliye,
    birim,
  } = formData;

  // UI states
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adliyeListesi, setAdliyeListesi] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    // Adliye listesini getir
    axios
      .get("/api/courthouses/list")
      .then((response) => {
        if (response.data && response.data.courthouses) {
          setAdliyeListesi(response.data.courthouses);
        }
      })
      .catch((error) => {
        console.error("Adliye listesi yüklenirken hata:", error);
      });

    // Eğer token varsa ve geçerliyse ana sayfaya yönlendir
    const token = cookies.get("TOKEN");
    if (token) {
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
          }
        })
        .catch(() => {
          cookies.remove("TOKEN", { path: "/" });
        });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Input değiştiğinde o alana ait validasyon hatasını temizle
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }

    // Genel hata mesajını temizle
    setError(false);
    setErrorMessage("");
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Sicil numarasını işle ve kontrol et
    let processedSicilNo = sicilNo.trim().replace(/\s+/g, "");
    if (processedSicilNo.toLowerCase().startsWith("ab")) {
      processedSicilNo = processedSicilNo.substring(2);
    }

    if (!processedSicilNo || !/^\d{4,9}$/.test(processedSicilNo)) {
      errors.sicilNo = "Sicil numarası 4-9 haneli sayı olmalıdır";
      isValid = false;
    }

    // Ad ve soyad kontrolü
    if (!ad.trim()) {
      errors.ad = "Ad alanı zorunludur";
      isValid = false;
    }

    if (!soyad.trim()) {
      errors.soyad = "Soyad alanı zorunludur";
      isValid = false;
    }

    // Şifre kontrolleri
    if (!password) {
      errors.password = "Şifre alanı zorunludur";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Şifre en az 6 karakter olmalıdır";
      isValid = false;
    }

    if (password !== passwordConfirm) {
      errors.passwordConfirm = "Şifreler eşleşmiyor";
      isValid = false;
    }

    // E-posta kontrolü (opsiyonel)
    if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = "Geçerli bir e-posta adresi giriniz";
      isValid = false;
    }

    // Telefon kontrolü (opsiyonel)
    if (telefon && !/^\d{10}$/.test(telefon)) {
      errors.telefon = "Telefon numarası 10 haneli olmalıdır (örn: 5301234567)";
      isValid = false;
    }

    // TCKN kontrolü (opsiyonel)
    if (tckn && !/^\d{11}$/.test(tckn)) {
      errors.tckn = "TC Kimlik Numarası 11 haneli olmalıdır";
      isValid = false;
    }

    // Adliye seçimi
    if (!adliye) {
      errors.adliye = "Lütfen bir adliye seçiniz";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError(true);
      setErrorMessage("Lütfen formdaki hataları düzeltiniz");
      return;
    }

    setLoading(true);

    // Sicil numarasını işle
    let processedSicilNo = sicilNo.trim().replace(/\s+/g, "");
    if (processedSicilNo.toLowerCase().startsWith("ab")) {
      processedSicilNo = processedSicilNo.substring(2);
    }
    const numericSicilNo = parseInt(processedSicilNo, 10);

    // Backend'e gönderilecek data
    const userData = {
      registrationNumber: numericSicilNo,
      name: ad.trim(),
      surname: soyad.trim(),
      password: password.trim(),
      roles: ["user"], // Varsayılan rol
      email: email || undefined,
      phoneNumber: telefon || undefined,
      tckn: tckn || undefined,
      birthDate: dogumTarihi || undefined,
      birthPlace: dogumYeri || undefined,
      bloodType: kanGrubu || "",
      keyboardType: keyboard || "",
      careerStartDate: meslekBaslangic || undefined,
      courtId: parseInt(adliye),
      unitName: birim || "Bilinmiyor",
    };

    axios({
      method: "POST",
      url: "/api/users/register",
      data: userData,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((result) => {
        setSuccess(true);
        setLoading(false);
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      })
      .catch((error) => {
        setLoading(false);
        const message =
          error.response?.data?.message || "Kayıt işlemi sırasında bir hata oluştu";
        setError(true);
        setErrorMessage(message);
      });
  };

  if (success) {
    return (
      <Container className="my-5">
        <Card className="login-card">
          <CardBody className="p-5 text-center">
            <div className="mb-4">
              <img
                src={logo}
                alt="logo"
                className="img-fluid logo-animation"
                style={{ maxWidth: "200px" }}
              />
            </div>
            <Alert color="success">
              <h4>Kayıt Başarılı!</h4>
              <p>Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...</p>
            </Alert>
            <Button color="primary" onClick={() => navigate("/login")}>
              Giriş Sayfasına Git
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="login-card">
        <Row className="g-0">
          <Col md="5" className="system-info text-white d-flex align-items-center">
            <div className="px-4 py-5 p-md-5">
              <h3 className="fw-bold mb-4">Kayıt Formu</h3>
              <p className="mb-4">
                Adliye Yönetim Sistemi'ne kayıt olmak için formu doldurunuz.
                
              </p>
            </div>
          </Col>

          <Col md="7" className="d-flex align-items-center">
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
                    style={{ maxWidth: "150px" }}
                  />
                </div>
                <h3 className="fw-bold mb-4" style={{ color: "#d32f2f" }}>
                  Hesap Oluştur
                </h3>
              </div>

              {error && (
                <Alert color="danger" className="mb-4 text-center fade-in">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {errorMessage}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* Temel Bilgiler */}
                  <Col md="12">
                    <FormGroup>
                      <Label for="sicilNo">Sicil Numarası *</Label>
                      <Input
                        id="sicilNo"
                        name="sicilNo"
                        value={sicilNo}
                        onChange={handleChange}
                        placeholder="Örn: ab123456 veya 123456"
                        invalid={!!validationErrors.sicilNo}
                      />
                      <FormFeedback>{validationErrors.sicilNo}</FormFeedback>
                      <small className="text-muted">
                        4-9 haneli sayı, "ab" öneki kullanılabilir
                      </small>
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="ad">Ad *</Label>
                      <Input
                        id="ad"
                        name="ad"
                        value={ad}
                        onChange={handleChange}
                        invalid={!!validationErrors.ad}
                      />
                      <FormFeedback>{validationErrors.ad}</FormFeedback>
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="soyad">Soyad *</Label>
                      <Input
                        id="soyad"
                        name="soyad"
                        value={soyad}
                        onChange={handleChange}
                        invalid={!!validationErrors.soyad}
                      />
                      <FormFeedback>{validationErrors.soyad}</FormFeedback>
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="password">Şifre *</Label>
                      <Input
                        id="password"
                        name="password"
                        value={password}
                        type={showPassword ? "text" : "password"}
                        onChange={handleChange}
                        invalid={!!validationErrors.password}
                      />
                      <FormFeedback>{validationErrors.password}</FormFeedback>
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="passwordConfirm">Şifre Tekrar *</Label>
                      <Input
                        id="passwordConfirm"
                        name="passwordConfirm"
                        value={passwordConfirm}
                        type={showPassword ? "text" : "password"}
                        onChange={handleChange}
                        invalid={!!validationErrors.passwordConfirm}
                      />
                      <FormFeedback>{validationErrors.passwordConfirm}</FormFeedback>
                    </FormGroup>
                  </Col>
                  
                  <div className="d-flex align-items-center mb-3">
                    <Input
                      type="checkbox"
                      id="showPassword"
                      className="me-2"
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    <Label for="showPassword" className="mb-0">
                      Şifreleri Göster
                    </Label>
                  </div>

                  {/* İletişim Bilgileri */}
                  <Col md="6">
                    <FormGroup>
                      <Label for="email">E-posta</Label>
                      <Input
                        id="email"
                        name="email"
                        value={email}
                        type="email"
                        onChange={handleChange}
                        invalid={!!validationErrors.email}
                        placeholder="ornek@adalet.gov.tr"
                      />
                      <FormFeedback>{validationErrors.email}</FormFeedback>
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="telefon">Telefon</Label>
                      <Input
                        id="telefon"
                        name="telefon"
                        value={telefon}
                        onChange={handleChange}
                        invalid={!!validationErrors.telefon}
                        placeholder="5301234567"
                      />
                      <FormFeedback>{validationErrors.telefon}</FormFeedback>
                    </FormGroup>
                  </Col>

                  {/* Kişisel Bilgiler */}
                  <Col md="6">
                    <FormGroup>
                      <Label for="tckn">TC Kimlik Numarası</Label>
                      <Input
                        id="tckn"
                        name="tckn"
                        value={tckn}
                        onChange={handleChange}
                        invalid={!!validationErrors.tckn}
                      />
                      <FormFeedback>{validationErrors.tckn}</FormFeedback>
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="dogumTarihi">Doğum Tarihi</Label>
                      <Input
                        id="dogumTarihi"
                        name="dogumTarihi"
                        value={dogumTarihi}
                        type="date"
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="dogumYeri">Doğum Yeri</Label>
                      <Input
                        id="dogumYeri"
                        name="dogumYeri"
                        value={dogumYeri}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="kanGrubu">Kan Grubu</Label>
                      <Input
                        id="kanGrubu"
                        name="kanGrubu"
                        type="select"
                        value={kanGrubu}
                        onChange={handleChange}
                      >
                        <option value="">Seçiniz</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="0+">0+</option>
                        <option value="0-">0-</option>
                      </Input>
                    </FormGroup>
                  </Col>

                  {/* Meslek Bilgileri */}
                  <Col md="6">
                    <FormGroup>
                      <Label for="keyboard">Klavye Tipi</Label>
                      <Input
                        id="keyboard"
                        name="keyboard"
                        type="select"
                        value={keyboard}
                        onChange={handleChange}
                      >
                        <option value="">Seçiniz</option>
                        <option value="F">F Klavye</option>
                        <option value="Q">Q Klavye</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="meslekBaslangic">Meslek Başlangıç Tarihi</Label>
                      <Input
                        id="meslekBaslangic"
                        name="meslekBaslangic"
                        value={meslekBaslangic}
                        type="date"
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="adliye">Adliye *</Label>
                      <Input
                        id="adliye"
                        name="adliye"
                        type="select"
                        value={adliye}
                        onChange={handleChange}
                        invalid={!!validationErrors.adliye}
                      >
                        <option value="0">Seçiniz</option>
                        {adliyeListesi.map(courthouse => (
                          <option 
                            key={courthouse.plateCode} 
                            value={courthouse.plateCode}
                          >
                            {courthouse.name}
                          </option>
                        ))}
                      </Input>
                      <FormFeedback>{validationErrors.adliye}</FormFeedback>
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="birim">Birim Adı</Label>
                      <Input
                        id="birim"
                        name="birim"
                        value={birim}
                        onChange={handleChange}
                        placeholder="Örn: Ceza Dairesi"
                      />
                    </FormGroup>
                  </Col>

                  <Col md="12" className="mt-4">
                    <Button
                      type="submit"
                      color="danger"
                      className="w-100 py-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Kayıt Yapılıyor...
                        </>
                      ) : (
                        "Kayıt Ol"
                      )}
                    </Button>
                  </Col>
                  
                  <Col md="12" className="text-center mt-3">
                    <p>
                      Zaten hesabınız var mı?{" "}
                      <a href="/login" className="text-danger">
                        Giriş Yap
                      </a>
                    </p>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}
