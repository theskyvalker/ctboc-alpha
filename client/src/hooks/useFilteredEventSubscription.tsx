import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.ts'; // Ensure Supabase client is initialized

// Define event type mappings
const eventTypeMap: { [key: string]: string } = {
  "0x3f8138418f99c63a092cde0d950a05f3aa54493ac84a496f41968062869038e": "Fortification",
  "0x39d6159682e91613f4abc864517b9507b2f2bf99abe5828e5d8aea50ebaeed9": "PlayerNickname",
  "0x97359d854872344978d58955c8b8698039b65329068db2fccfb00299fd18ee": "GameStageChange",
  "0x1714e9e59e5066247664bf1173dbd43d8f8e2aa813f4a53d553e8e38dff0096": "Sharpen",
  "0x31eacfb814d2763147c3ccc0df8ca99e5efe5c767bf27b2f2e578270e9721a5": "Attack",
  "0x3600420d060552ebc3686d80bf56734a37149182d1e1a00b8b5a607ed546f21": "Payment",
};

const eventsOfInterest = [
  "0x3f8138418f99c63a092cde0d950a05f3aa54493ac84a496f41968062869038e",
  "0x39d6159682e91613f4abc864517b9507b2f2bf99abe5828e5d8aea50ebaeed9",
  "0x97359d854872344978d58955c8b8698039b65329068db2fccfb00299fd18ee",
  "0x1714e9e59e5066247664bf1173dbd43d8f8e2aa813f4a53d553e8e38dff0096",
  "0x31eacfb814d2763147c3ccc0df8ca99e5efe5c767bf27b2f2e578270e9721a5",
  "0x3600420d060552ebc3686d80bf56734a37149182d1e1a00b8b5a607ed546f21",
];

// Custom hook that handles filtering, parsing, and returning the final formatted event data
const useFilteredEventSubscription = (gameId: number) => {
  const [formattedEvents, setFormattedEvents] = useState(""); // Store events as a single string
  const [formattedEventsNorth, setFormattedEventsNorth] = useState("");
  const [formattedEventsSouth, setFormattedEventsSouth] = useState("");

  // Function to format the timestamp
  function formatDateTime(dateString: string) {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      year: '2-digit',      // Two-digit year
      month: '2-digit',     // Two-digit month
      day: '2-digit',       // Two-digit day
      hour: '2-digit',      // Two-digit hour
      minute: '2-digit',    // Two-digit minute
      hour12: false
    };

    const locale = navigator.language || 'default';

    const formatter = new Intl.DateTimeFormat(locale, options);
    const parts = formatter.formatToParts(date);

    const dateTimeParts = {};
    parts.forEach(({ type, value }) => {
      //@ts-ignore
      dateTimeParts[type] = value;
    });

    //@ts-ignore
    const { day, month, year, hour, minute } = dateTimeParts;

    let dateStringFormatted;

    if (locale.startsWith('en-US')) {
      // MM/DD/YY for US
      dateStringFormatted = `${month}/${day}/${year}`;
    } else if (locale.startsWith('ja')) {
      // YY/MM/DD for Japan
      dateStringFormatted = `${year}/${month}/${day}`;
    } else {
      // DD/MM/YY for most other locales
      dateStringFormatted = `${day}/${month}/${year}`;
    }

    const formatted = `${dateStringFormatted} ${hour}:${minute}`;

    return formatted;
  }

  // Fetch historical events from Supabase
  const fetchHistoricalEvents = async () => {
    // Fetch events from 'gamelog' table where 'game_id' equals gameId
    const { data, error } = await supabase
      .from('gamelog')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching historical events:', error);
      return;
    }

    // Initialize formatted events
    let allMessages = formattedEvents;
    let northMessages = formattedEventsNorth;
    let southMessages = formattedEventsSouth;

    for (let event of data) {

      console.log(event);

      // Parse the event to get the formatted message
      const { castle, created_at, game_id, message: eventText } = event;

      // Format the timestamp
      const formattedDate = formatDateTime(event.created_at);

      // Construct the message with timestamp
      const formattedMessage = `[${formattedDate}] ${eventText}`;

      if (eventText.length) {
        allMessages += `${formattedMessage}\n`;
        if (castle === 'north') {
          northMessages += `${formattedMessage}\n`;
        } else if (castle === 'south') {
          southMessages += `${formattedMessage}\n`;
        }
      }
    }

    // Remove trailing newlines
    allMessages = allMessages.trim();
    northMessages = northMessages.trim();
    southMessages = southMessages.trim();

    // Update state
    setFormattedEvents(allMessages);
    setFormattedEventsNorth(northMessages);
    setFormattedEventsSouth(southMessages);
  };

  // Function to process new events from real-time subscription
  async function processEvent(event: any) {

    // Parse the event to get the formatted message
    const { castle, created_at, game_id, message: eventText } = event;

    // Format the timestamp
    const formattedDate = formatDateTime(created_at);

    // Construct the message with timestamp
    const formattedMessage = `[${formattedDate}] ${eventText}`;

    // Append the new message to the current state
    if (eventText.length) {
      setFormattedEvents((prevEvents) => `${prevEvents}\n${formattedMessage}`.trim());
      if (castle === 'north') {
        setFormattedEventsNorth((prevEvents) => `${prevEvents}\n${formattedMessage}`.trim());
      } else if (castle === 'south') {
        setFormattedEventsSouth((prevEvents) => `${prevEvents}\n${formattedMessage}`.trim());
      }
    }
  }

  useEffect(() => {
    // Fetch historical events when the component loads
    fetchHistoricalEvents();

    // Set up real-time subscription to Supabase
    const channel = supabase
      .channel('gamelog_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gamelog',
          filter: `game_id=eq.${gameId}`,
        },
        (payload: any) => {
          const newEvent = payload.new;
          processEvent(newEvent);
        }
      )
      .subscribe();

    // Cleanup subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return {
    formattedEvents,
    formattedEventsNorth,
    formattedEventsSouth,
  };
};

export default useFilteredEventSubscription;