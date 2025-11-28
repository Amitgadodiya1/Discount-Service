export const api = async (path, method = "GET", body) => {
  const userId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");

  try {
    const response = await fetch(`http://localhost:3000${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
        "X-User-Role": role,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorObj = new Error(data.error || "API request failed");
      errorObj.status = response.status;
      throw errorObj;
    }

    return { status: response.status, ...data };
  } catch (err) {
    console.error("API Error:", err.message);
    throw err;
  }
};
