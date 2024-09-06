import { gapi } from 'gapi-script';
import React, { useEffect, useState } from 'react';

const GoogleMeet = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [meetLink, setMeetLink] = useState(null);
  const [sessionType, setSessionType] = useState(null); 

  useEffect(() => {
    function start() {
      gapi.load('client:auth2', () => {
        gapi.auth2.init({
          client_id: '44838858216-r6gr1h3oa8927ec6b7hm1olht46hhcng.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/calendar.events',
        }).then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          // Load the Calendar API
          return gapi.client.load('calendar', 'v3');
        }).then(() => {
          console.log('Google Calendar API loaded');
        }).catch(err => {
          console.error('Error initializing Google Auth or loading Calendar API', err);
        });
      });
    }
    start();
  }, []);

  const handleAuthClick = () => {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(() => {
      setIsSignedIn(true);
      handleCreateMeet();
    }).catch(err => {
      console.error('Error signing in', err);
    });
  };

  const handleCreateMeet = async () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; 
    try {
      const event = {
        summary: 'Google Meet Session',
        description: 'Chat, voice, or video call using Google Meet.',
        start: {
          dateTime: '2024-09-01T09:00:00-07:00',
          timeZone: timeZone,
        },
        end: {
          dateTime: '2024-09-01T10:00:00-07:00',
          timeZone: timeZone,
        },
        conferenceData: {
          createRequest: {
            requestId: 'sample123',
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const request = gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      request.execute((event) => {
        const meetLink = event.hangoutLink;
        const sessionType = event.conferenceData.conferenceSolution.name;

        if (meetLink) {
          setMeetLink(meetLink);
          setSessionType(sessionType);
        } else {
          alert('Error: Could not generate Meet link');
        }
      });
    } catch (error) {
      console.error('Error creating Meet link:', error);
    }
  };


  return (
    <div style={{ padding: '20px' }}>
    <h1>Google Meet Integration</h1>
    {!isSignedIn ? (
      <button onClick={handleAuthClick}>Sign in and Create Meet Session</button>
    ) : (
      <button onClick={handleCreateMeet}>Create Meet Session</button>
    )}

    {meetLink && (
      <div style={{ marginTop: '20px' }}>
        <h3>Session Details:</h3>
        <p><strong>Link:</strong> <a href={meetLink} target="_blank" rel="noopener noreferrer">{meetLink}</a></p>
        <p><strong>Type:</strong> {sessionType}</p>
      </div>
    )}
  </div>
  );
};

export default GoogleMeet;
