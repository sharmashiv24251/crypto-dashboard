import { Provider } from "react-redux";
import { store } from "./store";
import Nav from "./components/Nav";
import Table from "./components/Table";
import Header from "./components/Header";

const App = () => {
  return (
    <Provider store={store}>
      <Nav />
      <div className="flex flex-col items-center justify-center gap-12 pb-8 md:p-7 max-w-screen-2xl mx-auto">
        <Header />
        <Table />
      </div>
    </Provider>
  );
};

export default App;
