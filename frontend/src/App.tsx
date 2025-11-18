import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./router/ProtectedRoute";
import PublicOnlyRoute from "./router/PublicOnlyRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Layouts
import AppLayout from "./layout/AppLayout";
import QuotesLayout from "./pages/Quotes/Layout/QuotesLayouts";
import ShoppingLayout from "./pages/Shopping/layout/ShoppingLayouts";

// Auth pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

// App pages
import Home from "./pages/Dashboard/Home";
import MyQuotes from "./pages/Quotes/MyQuotes";
import Quotes from "./pages/Quotes/Quotes";
import QuotesNew from "./pages/Quotes/New";
import QuotesFollowUps from "./pages/Quotes/FollowUps";
import QuotesHistory from "./pages/Quotes/History";
import QuotesAssignment from "./pages/Quotes/Assignment";
import Shopping from "./pages/Shopping/Shopping";
import ShoppingAssignment from "./pages/Shopping/Assignment";
import ShoppingFollowUps from "./pages/Shopping/FollowUps";
import ShoppingHistory from "./pages/Shopping/History";
import ShoppingNew from "./pages/Shopping/New";
import Profiles from "./pages/users/Profiles";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";

const SHOPPING_MANAGER_ROLES = ["ADMIN"];
const QUOTES_SUPERVISOR_ROLES = ["SUPERVISOR", "ADMIN"];

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* públicas solo */}
        <Route path="/signin" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
        

            {/* SHOPPING */}
            <Route path="/shopping" element={<ShoppingLayout />}>
              <Route index element={<Shopping />} />
              <Route path="new" element={<ShoppingNew />} />
              <Route path="follow-ups" element={<ShoppingFollowUps />} />
              <Route path="history" element={<ShoppingHistory />} />
              <Route
                path="assignment"
                element={
                  <ProtectedRoute roles={SHOPPING_MANAGER_ROLES}>
                    <ShoppingAssignment />
                  </ProtectedRoute>
                }
              />
            </Route>


        {/* protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/quotes" replace />} />

          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />

            {/* QUOTES */}
            <Route path="/quotes" element={<QuotesLayout />}>
              <Route index element={<Quotes />} />
              <Route path="new" element={<QuotesNew />} />
              <Route path="my-quotes" element={<MyQuotes />} />
              <Route path="follow-ups" element={<QuotesFollowUps />} />
              <Route path="history" element={<QuotesHistory />} />
              <Route
                path="assignment"
                element={
                  <ProtectedRoute roles={QUOTES_SUPERVISOR_ROLES}>
                    <QuotesAssignment />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* SHOPPING */}
            <Route path="/shopping" element={<ShoppingLayout />}>
              <Route index element={<Shopping />} />
              <Route path="new" element={<ShoppingNew />} />
              <Route path="follow-ups" element={<ShoppingFollowUps />} />
              <Route path="history" element={<ShoppingHistory />} />
              <Route
                path="assignment"
                element={
                  <ProtectedRoute roles={SHOPPING_MANAGER_ROLES}>
                    <ShoppingAssignment />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* genéricas */}
            <Route path="/Profiles" element={<Profiles />} />
            <Route path="/settings" element={<UserProfiles />} />
            <Route path="/roles" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
