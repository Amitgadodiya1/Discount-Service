export const api = async (path, method = "GET", body) => {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

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
      errorObj.status = response.status;   // attach status
      throw errorObj;                       // throw to caller
    }

    return { status: response.status, ...data };
  } catch (err) {
    console.error("API Error:", err.message);
    throw err; // rethrow so component can handle
  }
};
