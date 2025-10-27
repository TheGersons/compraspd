import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Quotes from "./pages/Quotes/Quotes";
import QuotesNew from "./pages/Quotes/New";
import QuotesFollowUps from "./pages/Quotes/FollowUps";
import QuotesHistory from "./pages/Quotes/History";
import QuotesAssignment from "./pages/Quotes/Assignment";
import QuotesLayout from "./pages/Quotes/Layout/QuotesLayouts";
import ShoppingLayout from "./pages/Shopping/layout/ShoppingLayouts";
import Shopping from "./pages/Shopping/Shopping";
import ShoppingAssignment from "./pages/Shopping/Assignment";
import ShoppingFollowUps from "./pages/Shopping/FollowUps";
import ShoppingHistory from "./pages/Shopping/History";
import ShoppingNew from "./pages/Shopping/New";
import Profiles from "./pages/users/Profiles"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyQuotes from "./pages/Quotes/MyQuotes";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Navigate to="/quotes" replace />} />


            {/*Rutas reales a usar*/}

            {/*  Quotes  */}
            <Route path="/quotes" element={<QuotesLayout />}>
              <Route index element={<Quotes />} />
              <Route path="new" element={<QuotesNew />} />
              <Route path= "my-quotes" element={<MyQuotes/>} />
              <Route path="follow-ups" element={<QuotesFollowUps />} />
              <Route path="history" element={<QuotesHistory />} />
              <Route path="assignment" element={<QuotesAssignment />} />
            </Route>

            {/* Rutas de compras */}
            <Route path="/shopping" element={<ShoppingLayout />}>
              <Route index element={<Shopping />} />
              <Route path="new" element={<ShoppingNew />} />
              <Route path="follow-ups" element={<ShoppingFollowUps />} />
              <Route path="history" element={<ShoppingHistory />} />
              <Route path="assignment" element={<ShoppingAssignment />} />
            </Route>

            {/* rutas de dashboards */}

            <Route path="/home" element={<Home />} />


            {/*Rutas genericas para ejemplos*/}

            {/* Others Page */}
            <Route path="/Profiles" element={<Profiles />} />
            <Route path="/settings" element={<UserProfiles />} />
            <Route path="/roles" element={<UserProfiles />} />  

            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
