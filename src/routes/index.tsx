import { useContext, useEffect } from 'react';
import { Navigate, RouterProvider, createBrowserRouter, createHashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { AuthContext } from '~/providers/authContext';
import { AddNewFriends } from '~/routes/AppRoutes/AddNewFriends';
import { InvitePeople } from '~/routes/AppRoutes/InvitePeople';
import { Place } from '~/routes/AppRoutes/Place';
import { PostsPage } from '~/routes/AppRoutes/Posts';
import { Profile } from '~/routes/AppRoutes/Profile';
import { Settings } from '~/routes/AppRoutes/Settings';
import { UserProfile } from '~/routes/AppRoutes/UserProfile';
import { Intro } from '~/routes/Auth/Intro';

import CreateTrip from './AppRoutes/CreateTrip/CreateTrip';
import { DeletePersonalDataInfo } from './AppRoutes/DeletePersonalDataInfo';
import { PrivacyPolicy } from './AppRoutes/PrivacyPolicy';
import SearchTrips from './AppRoutes/SearchTrips';
import { Trip } from './AppRoutes/Trip/Trip';

const Navigator = () => {
  const { currentUser, loading } = useContext(AuthContext);

  const router = createHashRouter([
    {
      path: '/',
      element: <Intro />,
    },
    {
      path: '/profile',
      element: loading ? <Intro /> : currentUser ? <Profile /> : <Navigate to={'/'} />,
    },
    {
      path: '/posts/:id',
      element: loading ? <Intro /> : currentUser ? <PostsPage /> : <Navigate to={'/'} />,
    },
    {
      path: '/add-friends',
      element: loading ? <Intro /> : currentUser ? <AddNewFriends /> : <Navigate to={'/'} />,
    },
    {
      path: '/invite-people',
      element: loading ? <Intro /> : currentUser ? <InvitePeople /> : <Navigate to={'/'} />,
    },
    {
      path: '/settings',
      element: loading ? <Intro /> : currentUser ? <Settings /> : <Navigate to={'/'} />,
    },
    {
      path: '/place/:id',
      element: loading ? <Intro /> : currentUser ? <Place /> : <Navigate to={'/'} />,
    },
    {
      path: '/trip/:id',
      element: loading ? <Intro /> : currentUser ? <Trip /> : <Navigate to={'/'} />,
    },
    {
      path: '/user/:id',
      element: loading ? <Intro /> : currentUser ? <UserProfile /> : <Navigate to={'/'} />,
    },
    {
      path: '/trip/create',
      element: loading ? <Intro /> : currentUser ? <CreateTrip /> : <Navigate to={'/'} />,
    },
    {
      path: '/search',
      element: loading ? <Intro /> : currentUser ? <SearchTrips /> : <Navigate to={'/'} />,
    },
    {
      path: '/privacy-policy',
      element: <PrivacyPolicy />,
    },
    {
      path: '/delete-personal-data-info',
      element: <DeletePersonalDataInfo />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer closeOnClick autoClose={3000} limit={1} pauseOnHover={false} />{' '}
    </>
  );
};

export default Navigator;
