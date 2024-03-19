import React from 'react';

export const InviteLetter = ({ link, title, description }) => {
  return (
    <div style={{ margin: '0', padding: '0 !important', backgroundColor: '#DAE0E1' }}>
      <center role="article" aria-roledescription="email" lang="en" style={{ width: '100%', backgroundColor: '#DAE0E1' }}>
        {/* Email Body */}
        <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="640" style={{ margin: 'auto' }} className="email-container">
          {/* Unsubscribe */}
          <tr>
            <td style={{ padding: '20px 32px', textAlign: 'center' }}>
              <p style={{ height: 'auto', margin: '15px 0', background: '#F5F6F8', fontFamily: 'Open Sans', fontSize: '11px', lineHeight: '15px', color: '#555555', backgroundColor: '#F5F6F8' }}>
                {/* Unable to view? Read it <a href={viewLink} className="link-btn">online</a> */}
              </p>
            </td>
          </tr>
          {/* Logo */}
          <tr>
            <td className="logo" style={{ padding: '10px 0 32px', textAlign: 'center', backgroundColor: "#fff" }}>
              <img src="https://api.smtprelay.co/userfile/98d7bd03-3ba8-47b6-a9a0-cb2594bf32cd/headerLogo.png" title="headerLogo.png" alt="headerLogo.png" style={{ maxWidth: '100%', height: 'auto' }} />
            </td>
          </tr>
          {/* Header image */}
          <tr>
            <td>
              <img src="https://api.smtprelay.co/userfile/98d7bd03-3ba8-47b6-a9a0-cb2594bf32cd/LoginBackground.png" title="LoginBackground.png" alt="LoginBackground.png" style={{ maxWidth: '100%', height: 'auto' }} />
            </td>
          </tr>
          {/* Section: email title */}
          <tr>
            <td style={{ padding: '48px 32px 20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <p className="header-text" style={{ height: 'auto', margin: '15px 0', background: '#ffffff', fontFamily: 'Open Sans', textAlign: 'center', fontSize: '32px', lineHeight: '34px', color: '#000000', backgroundColor: '#ffffff' }}>
                {/* No More Travel Advice From Strangers! */}
                {title}
              </p>
              <p style={{ height: 'auto', margin: '28px 0 15px', background: '#ffffff', textAlign: 'center', fontFamily: 'Open Sans', fontSize: '15px', lineHeight: '27px', color: '#5F5F5F', backgroundColor: '#ffffff' }}>
                We've created a platform to get travel advice from your friend's circle
              </p>
            </td>
          </tr>
          <td style={{ padding: '20px 32px 64px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            {/* Button */}
            <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ margin: 'auto', padding: '20px' }}>
              <tr>
                <td className="button-td button-td-primary" style={{ borderRadius: '4px', background: '#2e66ff' }}>
                  <a className="button-a button-a-primary" href={link} style={{ background: '#2e66ff', border: '1px solid #2e66ff', fontFamily: 'Open Sans', fontSize: '16px', lineHeight: 'inherit', textDecoration: 'none', padding: '16px', color: '#ffffff', display: 'block', borderRadius: '4px' }}>
                    Go to TripAmi
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </table>
      </center>
    </div>
  );
};

