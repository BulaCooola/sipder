// import blogRoutes from './sitblogs.js';
import routes from "./routes.js";

const constructorMethod = (app) => {
  // Routes
  app.get("/", (req, res) => {
    res.send("TEV Data Receiver API is running!");
  });
  //   app.use('/sitblog', blogRoutes);
  app.use("/", routes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

export default constructorMethod;
