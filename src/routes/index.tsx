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
  const { currentUser } = useContext(AuthContext);

  const router = createHashRouter([
    {
      path: '/',
      element: <Intro />,
    },
    {
      path: '/profile',
      element: currentUser ? <Profile /> : <Navigate to={'/'} />,
    },
    {
      path: '/posts/:id',
      element: currentUser ? <PostsPage /> : <Navigate to={'/'} />,
    },
    {
      path: '/add-friends',
      element: currentUser ? <AddNewFriends /> : <Navigate to={'/'} />,
    },
    {
      path: '/invite-people',
      element: currentUser ? <InvitePeople /> : <Navigate to={'/'} />,
    },
    {
      path: '/settings',
      element: currentUser ? <Settings /> : <Navigate to={'/'} />,
    },
    {
      path: '/place/:id',
      element: currentUser ? <Place /> : <Navigate to={'/'} />,
    },
    {
      path: '/trip/:id',
      element: currentUser ? <Trip /> : <Navigate to={'/'} />,
    },
    {
      path: '/user/:id',
      element: currentUser ? <UserProfile /> : <Navigate to={'/'} />,
    },
    {
      path: '/trip/create',
      element: currentUser ? <CreateTrip /> : <Navigate to={'/'} />,
    },
    {
      path: '/search',
      element: currentUser ? <SearchTrips /> : <Navigate to={'/'} />,
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
