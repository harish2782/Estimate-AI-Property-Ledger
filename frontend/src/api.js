import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const client = axios.create({ baseURL: API_BASE, timeout: 15000 });

export const predictPrice = (payload) => client.post("/api/predict", payload).then((r) => r.data);

export const valuateProperty = (payload) => client.post("/api/valuate", payload).then((r) => r.data);

export const recommendProperties = (payload) => client.post("/api/recommend", payload).then((r) => r.data);

export const getAnalytics = () => client.get("/api/analytics").then((r) => r.data);

export const getModelMetrics = () => client.get("/api/admin/metrics").then((r) => r.data);

export default client;
