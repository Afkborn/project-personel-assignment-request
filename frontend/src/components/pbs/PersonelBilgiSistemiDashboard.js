import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Alert,
  Spinner,
  Badge,
} from "reactstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import {
  FaUser,
  FaExchangeAlt,
  FaCalendarAlt,
  FaCamera,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import defaultAvatar from "../../assets/default-avatar.png";
import NavigationBar from "../navbar/Navbar";
const cookies = new Cookies();

export default function PersonelBilgiSistemiDashboard() {
  const [activeTab, setActiveTab] = useState("1"); // Aktif tab durumu
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Kan grubu seçenekleri
  const bloodTypes = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];
  const keyboardTypes = ["", "F", "Q"];

  useEffect(() => {
    // Kullanıcı bilgilerini getir
    fetchUserData();
  }, []);

  // Kullanıcı bilgilerini getir
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
        return;
      }

      const response = await axios({
        method: "GET",
        url: "/api/users/me",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserData(response.data.user);
      setFormData(response.data.user); // Form verilerini başlangıçta kullanıcı bilgileriyle doldur
      setLoading(false);
    } catch (error) {
      console.error("Kullanıcı bilgileri alınırken hata:", error);
      setError(
        error.response?.data?.message ||
          "Kullanıcı bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
      setLoading(false);
    }
  };

  // Form alanlarını değiştir
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Kullanıcı bilgilerini güncelle
  const handleUpdateUserInfo = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = cookies.get("TOKEN");
      if (!token) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setSaveLoading(false);
        return;
      }

      const response = await axios({
        method: "PUT",
        url: "/api/users/update",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: formData,
      });

      setSuccess("Bilgileriniz başarıyla güncellendi.");
      setUserData(response.data.user);
      setEditMode(false);
      setSaveLoading(false);

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Kullanıcı bilgileri güncellenirken hata:", error);
      setError(
        error.response?.data?.message ||
          "Bilgileriniz güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
      setSaveLoading(false);
    }
  };

  // Tab'ı değiştir
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  // Yükleme sırasında gösterilecek içerik
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner color="danger" />
        <p className="mt-3">Bilgileriniz yükleniyor...</p>
      </Container>
    );
  }

  // Hata durumunda gösterilecek içerik
  if (error) {
    return (
      <Container className="my-5">
        <Alert color="danger" className="text-center">
          <h4>Bir hata oluştu!</h4>
          <p>{error}</p>
          <Button color="primary" onClick={fetchUserData}>
            Tekrar Dene
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div>
      <NavigationBar />

      <Container className="my-5">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold" style={{ color: "#d32f2f" }}>
              Personel Bilgi Sistemi
            </h2>
            <p className="text-muted">
              Kişisel bilgilerinizi görüntüleyebilir ve güncelleyebilirsiniz.
            </p>
          </Col>
        </Row>

        <Card className="shadow-sm mb-5">
          <CardBody className="p-0">
            <Row className="g-0">
              {/* Profil Bilgisi ve Fotoğraf - Soldaki Kısım */}
              <Col lg="3" className="border-end">
                <div className="p-4 text-center">
                  <div className="position-relative d-inline-block mb-4">
                    <img
                      src={userData?.profilePicture || defaultAvatar}
                      alt="Profil Fotoğrafı"
                      className="img-fluid rounded-circle"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                    <Button
                      color="light"
                      className="rounded-circle position-absolute"
                      style={{ bottom: "0", right: "0", padding: "8px" }}
                      title="Fotoğraf Yükle (Yakında)"
                      disabled={true}
                    >
                      <FaCamera />
                    </Button>
                  </div>

                  <h4 className="fw-bold mb-1">
                    {userData?.name} {userData?.surname}
                  </h4>
                  <p className="text-muted mb-2">
                    Sicil No: {userData?.registrationNumber}
                  </p>

                  {userData?.rolesVisible?.map((role, index) => (
                    <Badge key={index} color="danger" className="me-1 mb-3">
                      {role.label}
                    </Badge>
                  ))}

                  <div className="mt-4 text-start">
                    <p>
                      <strong>Adliye:</strong>{" "}
                      {userData?.court?.name || "Belirtilmemiş"}
                    </p>
                    <p>
                      <strong>Birim:</strong>{" "}
                      {userData?.unitName || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>
              </Col>

              {/* Tab İçeriği - Sağdaki Kısım */}
              <Col lg="9">
                <Nav tabs className="nav-tabs-custom">
                  <NavItem>
                    <NavLink
                      className={`${activeTab === "1" ? "active" : ""}`}
                      onClick={() => toggleTab("1")}
                      style={{ cursor: "pointer" }}
                    >
                      <FaUser className="me-2" />
                      Kişisel Bilgiler
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={`${activeTab === "2" ? "active" : ""}`}
                      onClick={() => toggleTab("2")}
                      style={{ cursor: "pointer" }}
                    >
                      <FaExchangeAlt className="me-2" />
                      Tayin Talepleri
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={`${activeTab === "3" ? "active" : ""}`}
                      onClick={() => toggleTab("3")}
                      style={{ cursor: "pointer" }}
                    >
                      <FaCalendarAlt className="me-2" />
                      İzin Talepleri
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab} className="p-4">
                  {/* Kişisel Bilgiler Tabı */}
                  <TabPane tabId="1">
                    {success && (
                      <Alert color="success" className="mb-3">
                        {success}
                      </Alert>
                    )}
                    {error && (
                      <Alert color="danger" className="mb-3">
                        {error}
                      </Alert>
                    )}

                    <div className="d-flex justify-content-between mb-4">
                      <h4 className="mb-0">Kişisel Bilgiler</h4>
                      <Button
                        color={editMode ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => setEditMode(!editMode)}
                      >
                        {editMode ? (
                          <>
                            <span className="d-none d-md-inline me-1">
                              İptal
                            </span>{" "}
                            <FaEdit />
                          </>
                        ) : (
                          <>
                            <span className="d-none d-md-inline me-1">
                              Düzenle
                            </span>{" "}
                            <FaEdit />
                          </>
                        )}
                      </Button>
                    </div>

                    <Form>
                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="email">E-posta</Label>
                            <Input
                              type="email"
                              name="email"
                              id="email"
                              value={
                                editMode
                                  ? formData?.email || ""
                                  : userData?.email || ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="phoneNumber">Telefon Numarası</Label>
                            <Input
                              type="text"
                              name="phoneNumber"
                              id="phoneNumber"
                              value={
                                editMode
                                  ? formData?.phoneNumber || ""
                                  : userData?.phoneNumber || ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="tckn">TC Kimlik Numarası</Label>
                            <Input
                              type="text"
                              name="tckn"
                              id="tckn"
                              value={
                                editMode
                                  ? formData?.tckn || ""
                                  : userData?.tckn || ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="birthDate">Doğum Tarihi</Label>
                            <Input
                              type="date"
                              name="birthDate"
                              id="birthDate"
                              value={
                                editMode
                                  ? formData?.birthDate
                                    ? new Date(formData.birthDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                  : userData?.birthDate
                                  ? new Date(userData.birthDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="birthPlace">Doğum Yeri</Label>
                            <Input
                              type="text"
                              name="birthPlace"
                              id="birthPlace"
                              value={
                                editMode
                                  ? formData?.birthPlace || ""
                                  : userData?.birthPlace || ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="bloodType">Kan Grubu</Label>
                            <Input
                              type="select"
                              name="bloodType"
                              id="bloodType"
                              value={
                                editMode
                                  ? formData?.bloodType || ""
                                  : userData?.bloodType || ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            >
                              {bloodTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type || "Seçiniz"}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="isMartyrRelative">Şehit/Gazi Yakını</Label>
                            <div className="d-flex align-items-center mt-2">
                              <Input
                                type="checkbox"
                                name="isMartyrRelative"
                                id="isMartyrRelative"
                                checked={
                                  editMode
                                    ? formData?.isMartyrRelative
                                    : userData?.isMartyrRelative
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    isMartyrRelative: e.target.checked,
                                  })
                                }
                                disabled={!editMode}
                              />
                              <Label
                                for="isMartyrRelative"
                                className="ms-2 mb-0"
                              >
                                Şehit ve/veya Gazi yakınıyım
                              </Label>
                            </div>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="isDisabled">Engel Durumu</Label>
                            <div className="d-flex align-items-center mt-2">
                              <Input
                                type="checkbox"
                                name="isDisabled"
                                id="isDisabled"
                                checked={
                                  editMode
                                    ? formData?.isDisabled
                                    : userData?.isDisabled
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    isDisabled: e.target.checked,
                                  })
                                }
                                disabled={!editMode}
                              />
                              <Label for="isDisabled" className="ms-2 mb-0">
                                Engelim var
                              </Label>
                            </div>
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="keyboardType">Klavye Tipi</Label>
                            <Input
                              type="select"
                              name="keyboardType"
                              id="keyboardType"
                              value={
                                editMode
                                  ? formData?.keyboardType || ""
                                  : userData?.keyboardType || ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            >
                              {keyboardTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type
                                    ? type === "F"
                                      ? "F Klavye"
                                      : "Q Klavye"
                                    : "Seçiniz"}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="unitName">Birim Adı</Label>
                            <Input
                              type="text"
                              name="unitName"
                              id="unitName"
                              value={
                                editMode
                                  ? formData?.unitName || ""
                                  : userData?.unitName || ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="careerStartDate">
                              Meslek Başlangıç Tarihi
                            </Label>
                            <Input
                              type="date"
                              name="careerStartDate"
                              id="careerStartDate"
                              value={
                                editMode
                                  ? formData?.careerStartDate
                                    ? new Date(formData.careerStartDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                  : userData?.careerStartDate
                                  ? new Date(userData.careerStartDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="unitStartDate">
                              Birim Başlangıç Tarihi
                            </Label>
                            <Input
                              type="date"
                              name="unitStartDate"
                              id="unitStartDate"
                              value={
                                editMode
                                  ? formData?.unitStartDate
                                    ? new Date(formData.unitStartDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                  : userData?.unitStartDate
                                  ? new Date(userData.unitStartDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={handleInputChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>

                        {editMode && (
                          <Col xs={12} className="mt-3 text-end">
                            <Button
                              color="secondary"
                              className="me-2"
                              onClick={() => {
                                setEditMode(false);
                                setFormData(userData); // Form verilerini sıfırla
                              }}
                            >
                              İptal
                            </Button>
                            <Button
                              color="danger"
                              onClick={handleUpdateUserInfo}
                              disabled={saveLoading}
                            >
                              {saveLoading ? (
                                <>
                                  <Spinner size="sm" className="me-2" />
                                  Kaydediliyor...
                                </>
                              ) : (
                                <>
                                  <FaSave className="me-2" />
                                  Kaydet
                                </>
                              )}
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </Form>
                  </TabPane>

                  {/* Tayin Talepleri Tabı */}
                  <TabPane tabId="2">
                    <div className="text-center py-5">
                      <FaExchangeAlt size={48} className="text-muted mb-3" />
                      <h4 className="mb-3">Tayin Talepleri</h4>
                      <p className="text-muted">
                        Bu bölüm henüz aktif değil. Yakında tayin taleplerinizi
                        bu ekrandan yönetebileceksiniz.
                      </p>
                      <Button color="outline-primary" disabled>
                        Yeni Tayin Talebi Oluştur
                      </Button>
                    </div>
                  </TabPane>

                  {/* İzin Talepleri Tabı */}
                  <TabPane tabId="3">
                    <div className="text-center py-5">
                      <FaCalendarAlt size={48} className="text-muted mb-3" />
                      <h4 className="mb-3">İzin Talepleri</h4>
                      <p className="text-muted">
                        Bu bölüm henüz aktif değil. Yakında izin taleplerinizi
                        bu ekrandan yönetebileceksiniz.
                      </p>
                      <Button color="outline-primary" disabled>
                        Yeni İzin Talebi Oluştur
                      </Button>
                    </div>
                  </TabPane>
                </TabContent>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
