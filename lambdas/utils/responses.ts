const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const statusSuccess = (body?: any) => ({
  statusCode: 200,
  headers,
  body: JSON.stringify(body),
});

export const statusCreate = () => ({
  statusCode: 201,
  headers,
  body: JSON.stringify({
    message: "success",
  }),
});

export const statusFail = (message: string = "Bad Request") => ({
  statusCode: 400,
  headers,
  body: JSON.stringify({
    message,
  }),
});

export const statusForbidden = () => ({
  statusCode: 403,
  headers,
  body: JSON.stringify({
    message: "Forbidden",
  }),
});
