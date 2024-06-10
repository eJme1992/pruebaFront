export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const BASE_URL = "http://127.0.0.1:8080";
export function fetch(url, options, success, error) {
  const { headers = {}, method, body = {}, dataType = "json" } = options;
  $.ajax({
    url: url,
    headers,
    type: method,
    data: body,
    dataType,
    success: success,
    error: error,
  });
}
export const THANK_LOTTIE = `<dotlottie-player src="https://lottie.host/82084d97-08de-453b-98b0-bd144b9bf99f/boOvq2CSf1.json" background="transparent" speed="1" style="width: 400px; height: 400px;" loop autoplay></dotlottie-player>`;

export const buildOptionsByToken = (token, method = "POST", data) => {
  return {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  };
};
