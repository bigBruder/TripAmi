import {useContext, useEffect} from "react";
import {AuthContext} from "~/providers/authContext";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Intro} from "~/routes/Auth/Intro";
import {Profile} from "~/routes/AppRoutes/Profile";
import {PostsPage} from "~/routes/AppRoutes/Posts";
import {AddNewFriends} from "~/routes/AppRoutes/AddNewFriends";
import {InvitePeople} from "~/routes/AppRoutes/InvitePeople";
import {Settings} from "~/routes/AppRoutes/Settings";
import {Place} from "~/routes/AppRoutes/Place";
import {UserProfile} from "~/routes/AppRoutes/UserProfile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Intro />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/posts',
    element: <PostsPage />,
  },
  {
    path: '/add-friends',
    element: <AddNewFriends />,
  },
  {
    path: '/invite-people',
    element: <InvitePeople />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/place/:id',
    element: <Place />,
  },
  {
    path: '/user/:id',
    element: <UserProfile />,
  }
]);

const Navigator = () => {
  const {currentUser, loading} = useContext(AuthContext);

  const routArray = window.location.href.split('/');

  useEffect(() => {
    if (!currentUser && routArray[routArray.length - 1].length !== 0 && !loading) {
      window.history.pushState({}, "/", "/");
      window.location.reload();
    }
  }, [currentUser, loading]);

  return <RouterProvider router={router} />
}

export default Navigator;
