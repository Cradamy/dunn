/*
 * @Plugin        sup
 * @Description   replies to "what's up?" or "sup?"
 *
 * @Author        buttcactus
 * @Website       http://www.digitalkitsune.net
 * @Copyright     DIGITAL KITSUNE 2012
 *
 * @Based         http://www.ibiblio.org/pub/packages/irc/eggdrop/scripts/1.0/botcall.tcl.gz
 *
 */
 
var Plugin = module.exports = function (irc) {
  irc.addMessageHandler("what's up", this.sup);
  irc.addMessageHandler("whats up", this.sup);
  irc.addMessageHandler("what is up", this.sup);
  // irc.addMessageHandler("sup", this.sup);
};

Plugin.prototype.sup = function(irc, channel, nick, match, message, raw) {
     var replies = ["Best file compression around: 'DEL *.*' = 100% compression",
     "If debugging is the process of removing bugs, then programming must be the process of putting them in.",
     "Programmers don't die, they just GOSUB without RETURN.",
     "Programmer - A red-eyed, mumbling mammal capable of conversing with inanimate objects.",
     "Real programmers don't document. 'If it was hard to write, it should be hard to understand.'",
     "Be nice to your kids. They'll choose your nursing home.",
     "Beauty is in the eye of the beer holder...",
     "There are 3 kinds of people: those who can count & those who can't.",
     "Why is 'abbreviation' such a long word?",
     "Don't use a big word where a diminutive one will suffice.",
     "Every morning is the dawn of a new error...",
     "A flying saucer results when a nudist spills his coffee.",
     "For people who like peace and quiet: a phoneless cord.",
     "I can see clearly now, the brain is gone...",
     "The beatings will continue until morale improves.",
     "I used up all my sick days, so I'm calling in dead.",
     "Mental Floss prevents Moral Decay.",
     "Madness takes its toll. Please have exact change.",
     "Proofread carefully to see if you any words out.",
     "There cannot be a crisis today; my schedule is already full.",
     "I'd explain it to you, but your brain would explode.",
     "Ever stop to think, and forget to start again?",
     "A conclusion is simply the place where you got tired of thinking.",
     "I don't have a solution but I admire the problem.",
     "Don't be so open-minded your brains will fall out.",
     "If at first you DO succeed, try not to look astonished!",
     "Diplomacy is the art of saying 'Nice doggie!'... till you can find a rock.",
     "Diplomacy - the art of letting someone have your way.",
     "If one synchronized swimmer drowns, do the rest have to drown too?",
     "If things get any worse, I'll have to ask you to stop helping me.",
     "If I want your opinion, I'll ask you to fill out the necessary forms.",
     "Don't look back, they might be gaining on you.",
     "It's not hard to meet expenses, they're everywhere.",
     "Help Wanted: Telepath. You know where to apply.",
     "Look out for #1. Don't step in #2 either.",
     "Budget: A method for going broke methodically.",
     "Car service: If it ain't broke, we'll break it.",
     "Shin: A device for finding furniture in the dark.",
     "Do witches run spell checkers?",
     "Demons are a Ghouls best Friend.",
     "Copywight 1994 Elmer Fudd. All wights wesewved.",
     "Dain bramaged.",
     "Department of Redundancy Department",
     "Headline: Bear takes over Disneyland in Pooh D'Etat!",
     "What has four legs and an arm? A happy pit bull.",
     "Cannot find REALITY.SYS. Universe halted.",
     "COFFEE.EXE Missing - Insert Cup and Press Any Key",
     "Buy a Pentium 586/90 so you can reboot faster.",
     "2 + 2 = 5 for extremely large values of 2.",
     "Computers make very fast, very accurate mistakes.",
     "Computers are not intelligent. They only think they are.",
     "My software never has bugs. It just develops random features.",
     "C:\\WINDOWS C:\\WINDOWS\\GO C:\\PC\\CRAWL",
     "C:\\DOS C:\\DOS\\RUN RUN\\DOS\\RUN",
     "<-------- The information went data way --------",
     "The Definition of an Upgrade: Take old bugs out, put new ones in.",
     "BREAKFAST.COM Halted...Cereal Port Not Responding",
     "The name is Baud......, James Baud.",
     "BUFFERS=20 FILES=15 2nd down, 4th quarter, 5 yards to go!",
     "Access denied--nah nah na nah nah!",
     "C:\\ Bad command or file name! Go stand in the corner.",
     "Bad command. Bad, bad command! Sit! Stay! Staaay..",
     "Why doesn't DOS ever say 'EXCELLENT command or filename!'",
     "As a computer, I find your faith in technology amusing.",
     "Southern DOS: Y'all reckon? (Yep/Nope)",
     "Backups? We don' *NEED* no steenking backups.",
     "E Pluribus Modem",
     "File not found. Should I fake it? (Y/N)",
     "Ethernet (n): something used to catch the etherbunny",
     "A mainframe: The biggest PC peripheral available.",
     "An error? Impossible! My modem is error correcting.",
     "CONGRESS.SYS Corrupted: Re-boot Washington D.C (Y/n)?",
     "Does fuzzy logic tickle?",
     "A computer's attention span is as long as it's power cord.",
     "11th commandment - Covet not thy neighbor's Pentium.",
     "24 hours in a day...24 beers in a case...coincidence?",
     "Disinformation is not as good as datinformation.",
     "Windows: Just another pain in the glass.",
     "SENILE.COM found . . . Out Of Memory . . .",
     "Who's General Failure & why's he reading my disk?",
     "Ultimate office automation: networked coffee.", 
     "RAM disk is *not* an installation procedure.",
     "Shell to DOS... Come in DOS, do you copy? Shell to DOS...",
     "All computers wait at the same speed.",
     "DEFINITION: Computer - A device designed to speed and automate errors.",
     "Press Smash forehead on keyboard to continue.....",
     "Enter any 11-digit prime number to continue...",
     "ASCII stupid question, get a stupid ANSI!",
     "E-mail returned to sender -- insufficient voltage.",
     "Help! I'm modeming... and I can't hang up!!!",
     "All wiyht. Rho sritched mg kegtops awound?",
     "Error: Keyboard not attached. Press F1 to continue.",
     "'640K ought to be enough for anybody.' - Bill Gates, 1981",
     "DOS Tip #17: Add DEVICE=FNGRCROS.SYS to CONFIG.SYS",
     "Hidden DOS secret: add BUGS=OFF to your CONFIG.SYS",
     "Press any key... no, no, no, NOT THAT ONE!",
     "Press any key to continue or any other key to quit...",
     "Excuse me for butting in, but I'm interrupt-driven.",
     "REALITY.SYS corrupted: Reboot universe? (Y/N/Q)",
     "Sped up my XT; ran it on 220v! Works greO?_~",
     "Error reading FAT record: Try the SKINNY one? (Y/N)",
     "Read my chips: No new upgrades!",
     "Hit any user to continue.",
     "2400 Baud makes you want to get out and push!!",
     "I hit the CTRL key but I'm still not in control!",
     "Will the information superhighway have any rest stops?",
     "Disk Full - Press F1 to belch.",
     "Backup not found: (A)bort (R)etry (T)hrowup",
     "Backup not found: (A)bort (R)etry (P)anic",
     "(A)bort, (R)etry, (T)ake down entire network?",
     "(A)bort, (R)etry, (G)et a beer?"];
  irc.send(channel, replies[Math.floor(Math.random()*replies.length)]);
}
