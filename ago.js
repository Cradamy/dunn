exports.ago = ago;

function ago(milliseconds) {
  var originalDate = new Date(milliseconds);
  var newDate = new Date();
  var time = (newDate - originalDate) / 1000;
  var days = Math.floor(time / (60 * 60 * 24));
  if (days < 0) {
    return 'just now';
  } else if (days == 0) {
    var hours = Math.floor(time / (60 * 60));
    if (hours == 0) {
      var minutes = Math.floor(time / 60);
      if (minutes == 0) {
        return 'just now';
      } else if (minutes == 1) {
        return '1 minute';
      } else {
        return minutes + ' minutes';
      }
    } else if (hours == 1) {
      return '1 hour';
    } else {
      return hours + ' hours';
    }
  } else if (days == 1) {
    return '1 day';
  } else {
    return days + ' days';
  }
}