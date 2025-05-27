import axios from "axios";
import Cookies from "universal-cookie";
import { useState, useEffect } from "react";

const cookies = new Cookies();

/**
 * Her API isteği öncesinde token geçerliliğini kontrol eden ve otomatik logout işlemi yapan fonksiyon
 * @returns {Object} Authentication durumu ve logout fonksiyonu
 */
const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Token geçerliliğini kontrol et
  const checkTokenValidity = async () => {
    const token = cookies.get("TOKEN");
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const response = await axios({
        method: "POST",
        url: "/api/users/validate-token",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isValid = response.data.valid;
      setIsAuthenticated(isValid);
      return isValid;
    } catch (error) {
      console.error("Token geçerlilik kontrolü sırasında hata:", error);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Kullanıcı oturumunu sonlandır
  const forceLogout = (
    message = "Oturumunuz sonlandırıldı. Lütfen yeniden giriş yapın."
  ) => {
    // Cookie'yi ve diğer oturum verilerini temizle
    cookies.remove("TOKEN", { path: "/" });
    localStorage.removeItem("selectedKurum");

    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }

    // Kullanıcıyı bilgilendir ve yönlendir
    alert(message);
    window.location.href = "/login";
  };

  // İlk yükleme sırasında token geçerliliğini kontrol et
  useEffect(() => {
    const initialCheck = async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        // Token geçersizse ve korunan bir sayfada iseniz çıkış yaptır
        // Ana sayfa ve login sayfası için kontrol yapma
        if (!window.location.pathname.match(/^\/(login)?$/)) {
          forceLogout("Oturumunuzun süresi doldu veya şifreniz değiştirildi.");
        }
      }
    };

    initialCheck();

    // Her 5 dakikada bir token geçerliliğini kontrol et
    const intervalId = setInterval(() => {
      checkTokenValidity().then((isValid) => {
        if (!isValid && !window.location.pathname.match(/^\/(login)?$/)) {
          forceLogout("Oturumunuzun süresi doldu veya şifreniz değiştirildi.");
        }
      });
    }, 5 * 60 * 1000); // 5 dakika

    return () => clearInterval(intervalId);
  }, []);

  return { isAuthenticated, checkTokenValidity, forceLogout };
};

export default useAuthCheck;

/**
 * Axios interceptor ile her istekte otomatik token kontrolü yapan kurulum
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    async (config) => {
      // Ana sayfa ve login sayfası için istek özel ele al
      const publicPaths = ["/api/users/validate-token", "/api/users/login"];
      const isPublicPath = publicPaths.some((path) =>
        config.url.includes(path)
      );

      // İstek ana sayfa için ve token yoksa, istek yapma
      if (
        window.location.pathname === "/" &&
        !cookies.get("TOKEN") &&
        !isPublicPath
      ) {
        // İstek yapılmaması için Promise.reject kullan
        return Promise.reject(
          new axios.Cancel("Auth required endpoint skipped on public page")
        );
      }

      // Diğer durumlarda token varsa ekle
      const token = cookies.get("TOKEN");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Kasten iptal edilmiş istekleri sessizce ele al
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return new Promise(() => {}); // Boş promise ile çözümle
      }

      // 401 veya 403 hatalarında otomatik logout
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        // Ana sayfa veya login sayfasında değilsek logout işlemi yap
        if (!window.location.pathname.match(/^\/(login)?$/)) {
          cookies.remove("TOKEN", { path: "/" });
          localStorage.removeItem("selectedKurum");

          if (window.sessionStorage) {
            window.sessionStorage.clear();
          }

          alert("Oturumunuz sonlandırıldı. Lütfen yeniden giriş yapın.");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
};
