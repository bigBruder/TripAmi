import React, {useContext, useEffect, useMemo, useState} from 'react';
import {AuthContext} from '~/providers/authContext';
import {BrowserRouter as Router, Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import {Intro} from './Auth/Intro';
import {Profile} from './AppRoutes/Profile';
import {PostsPage} from './AppRoutes/Posts';
import {AddNewFriends} from './AppRoutes/AddNewFriends';
import {InvitePeople} from './AppRoutes/InvitePeople';
import {Settings} from './AppRoutes/Settings';

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Intro />,
//   },
//   {
//     path: '/profile',
//     element: <Profile />,
//   },
//   {
//     path: '/posts',
//     element: <PostsPage />,
//   },
//   {
//     path: '/add-friends',
//     element: <AddNewFriends />,
//   },
//   {
//     path: '/invite-people',
//     element: <InvitePeople />,
//   },
//   {
//     path: '/settings',
//     element: <Settings />,
//   }
// ]);

const Navigator = () => {
  const {currentUser, loading} = useContext(AuthContext);
  const navigate = useNavigate();

  return (
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/" />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/add-friends" element={<AddNewFriends />} />
        <Route path="/invite-people" element={<InvitePeople />} />
        <Route path="/settings" element={<Settings />} />
        {/* 
      <Route path="*" element={<PageNotFound />} /> 
    */}
      </Routes>
  );
};

export default Navigator;
