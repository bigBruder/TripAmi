export const timeAgo = (timestamp) => {
  if (!timestamp || !timestamp.seconds) {
    return 'Unknown';
  }

  const { seconds, nanoseconds } = timestamp;

  const givenDate = new Date(seconds * 1000 + nanoseconds / 1000000);
  const currentDate = new Date();

  const secondsDiff = Math.floor((currentDate - givenDate) / 1000);
  if (secondsDiff < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(secondsDiff / 60);
  if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 365) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};
