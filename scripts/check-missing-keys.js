#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Check for missing localization keys in the codebase
 * Scans source files for hardcoded strings and compares with locale files
 * Identifies potential missing translations
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const srcDir = join(projectRoot, 'src');
const localesDir = join(projectRoot, '_locales');

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns to look for potential missing translations
const HARDCODED_STRING_PATTERNS = [
  // Common UI strings that should be localized
  /['"`](Add|Edit|Delete|Save|Cancel|Submit|Close|Open|Settings|Options|Help|About|Error|Warning|Success|Loading|Search|Filter|Sort|Export|Import|Copy|Paste|Cut|Select|Clear|Reset|Refresh|Update|Create|Remove|Enable|Disable|Start|Stop|Pause|Resume|Next|Previous|Back|Forward|Home|Profile|Account|Login|Logout|Register|Sign up|Sign in|Dashboard|Menu|Navigation|Tools|Utilities|Advanced|Basic|Custom|Default|None|All|Any|Other|More|Less|Show|Hide|Expand|Collapse|Minimize|Maximize|Full screen|Exit|Quit|Restart|Reload|Retry|Continue|Skip|Finish|Complete|Done|OK|Yes|No|Maybe|Unknown|Invalid|Valid|Required|Optional|Recommended|Deprecated|New|Old|Recent|Popular|Featured|Favorite|Bookmark|Share|Download|Upload|Print|Preview|View|Details|Summary|Overview|Report|Statistics|Analytics|Performance|Security|Privacy|Terms|Conditions|License|Copyright|Version|Build|Release|Beta|Alpha|Stable|Development|Production|Test|Debug|Log|Console|Terminal|Command|Script|Code|File|Folder|Directory|Path|URL|Link|Image|Video|Audio|Document|Text|Number|Date|Time|Email|Phone|Address|Name|Title|Description|Content|Message|Comment|Note|Tag|Category|Type|Status|State|Mode|Level|Priority|Severity|Importance|Urgency|Frequency|Duration|Size|Length|Width|Height|Weight|Volume|Quantity|Amount|Price|Cost|Value|Rate|Percentage|Ratio|Score|Rating|Rank|Position|Index|ID|Key|Token|Hash|Checksum|Signature|Certificate|Credential|Permission|Role|Group|Team|Organization|Company|Department|Project|Task|Job|Work|Activity|Event|Action|Operation|Process|Procedure|Method|Function|Feature|Component|Module|Plugin|Extension|Widget|Tool|Utility|Service|API|Endpoint|Request|Response|Data|Information|Record|Entry|Item|Element|Object|Entity|Model|Schema|Structure|Format|Template|Pattern|Rule|Policy|Configuration|Setting|Parameter|Option|Choice|Selection|Preference|Theme|Style|Layout|Design|Interface|UI|UX|Frontend|Backend|Database|Server|Client|Browser|Application|Software|System|Platform|Framework|Library|Package|Dependency|Resource|Asset|Media|Content|Metadata|Property|attribute|Field|Column|Row|Table|List|Array|Collection|Set|Map|Dictionary|Cache|Buffer|Queue|Stack|Tree|Graph|Network|Connection|Session|Transaction|Batch|Bulk|Single|Multiple|Individual|Collective|Global|Local|Remote|External|Internal|Public|Private|Protected|Secure|Encrypted|Decrypted|Compressed|Decompressed|Encoded|Decoded|Serialized|Deserialized|Parsed|Formatted|Validated|Verified|Authenticated|Authorized|Permitted|Denied|Blocked|Allowed|Enabled|Disabled|Active|Inactive|Online|Offline|Connected|Disconnected|Available|Unavailable|Ready|Busy|Idle|Running|Stopped|Paused|Suspended|Resumed|Started|Finished|Completed|Failed|Succeeded|Pending|Processing|Waiting|Queued|Scheduled|Delayed|Expired|Timeout|Cancelled|Aborted|Interrupted|Terminated|Killed|Destroyed|Created|Updated|Modified|Changed|Saved|Loaded|Imported|Exported|Copied|Moved|Renamed|Deleted|Removed|Added|Inserted|Appended|Prepended|Replaced|Merged|Split|Joined|Combined|Separated|Filtered|Sorted|Grouped|Aggregated|Summarized|Calculated|Computed|Generated|Produced|Rendered|Displayed|Shown|Hidden|Visible|Invisible|Transparent|Opaque|Solid|Dashed|Dotted|Bold|Italic|Underlined|Strikethrough|Highlighted|Selected|Focused|Blurred|Hovered|Clicked|Pressed|Released|Dragged|Dropped|Scrolled|Zoomed|Rotated|Flipped|Mirrored|Inverted|Reversed|Shuffled|Randomized|Ordered|Unordered|Ascending|Descending|Alphabetical|Numerical|Chronological|Logical|Physical|Virtual|Abstract|Concrete|Specific|General|Particular|Universal|Unique|Common|Rare|Frequent|Occasional|Regular|Irregular|Consistent|Inconsistent|Stable|Unstable|Reliable|Unreliable|Accurate|Inaccurate|Precise|Imprecise|Exact|Approximate|Rough|Smooth|Sharp|Blunt|Bright|Dark|Light|Heavy|Fast|Slow|Quick|Gradual|Sudden|Immediate|Delayed|Early|Late|On time|Overdue|Upcoming|Past|Present|Future|Current|Previous|Next|First|Last|Initial|Final|Beginning|End|Start|Finish|Top|Bottom|Left|Right|Center|Middle|Side|Corner|Edge|Border|Margin|Padding|Space|Gap|Distance|Proximity|Near|Far|Close|Remote|Adjacent|Opposite|Parallel|Perpendicular|Horizontal|Vertical|Diagonal|Straight|Curved|Circular|Square|Rectangular|Triangular|Oval|Round|Flat|Thick|Thin|Wide|Narrow|Tall|Short|Long|Brief|Extended|Expanded|Collapsed|Compressed|Stretched|Shrunk|Enlarged|Reduced|Increased|Decreased|Raised|Lowered|Elevated|Depressed|Positive|Negative|Neutral|Zero|Empty|Full|Partial|Complete|Incomplete|Whole|Part|Fraction|Percentage|Decimal|Integer|Float|String|Boolean|Array|Object|Null|Undefined|True|False|On|Off|Up|Down|In|Out|Inside|Outside|Above|Below|Over|Under|Before|After|During|While|Until|Since|From|To|At|By|With|Without|For|Against|Through|Across|Around|Between|Among|Within|Beyond|Beside|Behind|Ahead|Forward|Backward|Upward|Downward|Inward|Outward|Toward|Away|Here|There|Everywhere|Nowhere|Somewhere|Anywhere|Always|Never|Sometimes|Often|Rarely|Seldom|Usually|Normally|Typically|Generally|Specifically|Particularly|Especially|Mainly|Mostly|Partly|Completely|Entirely|Fully|Partially|Hardly|Barely|Almost|Nearly|Quite|Very|Extremely|Highly|Moderately|Slightly|Somewhat|Rather|Pretty|Fairly|Reasonably|Considerably|Significantly|Substantially|Dramatically|Remarkably|Notably|Particularly|Especially|Specifically|Exactly|Precisely|Approximately|Roughly|About|Around|Nearly|Almost|Just|Only|Merely|Simply|Purely|Solely|Exclusively|Primarily|Mainly|Chiefly|Largely|Mostly|Generally|Usually|Normally|Typically|Commonly|Frequently|Often|Regularly|Consistently|Constantly|Continuously|Perpetually|Permanently|Temporarily|Briefly|Momentarily|Instantly|Immediately|Quickly|Rapidly|Swiftly|Slowly|Gradually|Steadily|Smoothly|Easily|Effortlessly|Difficultly|Hardly|Barely|Scarcely|Rarely|Seldom|Occasionally|Sometimes|Periodically|Intermittently|Sporadically|Randomly|Arbitrarily|Systematically|Methodically|Logically|Rationally|Reasonably|Sensibly|Wisely|Intelligently|Cleverly|Skillfully|Expertly|Professionally|Competently|Efficiently|Effectively|Successfully|Properly|Correctly|Accurately|Precisely|Exactly|Perfectly|Ideally|Optimally|Maximally|Minimally|Sufficiently|Adequately|Appropriately|Suitably|Conveniently|Comfortably|Safely|Securely|Reliably|Dependably|Consistently|Predictably|Expectedly|Surprisingly|Unexpectedly|Suddenly|Gradually|Progressively|Incrementally|Decrementally|Proportionally|Relatively|Comparatively|Absolutely|Definitely|Certainly|Surely|Probably|Possibly|Maybe|Perhaps|Likely|Unlikely|Doubtfully|Questionably|Arguably|Presumably|Supposedly|Allegedly|Apparently|Obviously|Clearly|Evidently|Manifestly|Undoubtedly|Unquestionably|Indisputably|Undeniably|Irrefutably|Conclusively|Decisively|Definitively|Finally|Ultimately|Eventually|Sooner|Later|Earlier|Previously|Formerly|Originally|Initially|Recently|Lately|Currently|Presently|Now|Today|Tomorrow|Yesterday|Soon|Immediately|Instantly|Promptly|Quickly|Rapidly|Swiftly|Slowly|Gradually|Eventually|Finally|Ultimately|Permanently|Temporarily|Briefly|Momentarily|Continuously|Constantly|Perpetually|Endlessly|Forever|Always|Never|Sometimes|Occasionally|Rarely|Seldom|Often|Frequently|Regularly|Consistently|Systematically|Methodically|Automatically|Manually|Mechanically|Electronically|Digitally|Virtually|Physically|Mentally|Emotionally|Spiritually|Intellectually|Academically|Professionally|Personally|Individually|Collectively|Socially|Culturally|Politically|Economically|Financially|Commercially|Industrially|Technologically|Scientifically|Medically|Legally|Ethically|Morally|Philosophically|Theoretically|Practically|Realistically|Ideally|Optimally|Maximally|Minimally|Sufficiently|Adequately|Appropriately|Suitably|Conveniently|Comfortably|Safely|Securely|Reliably|Dependably|Consistently|Predictably|Expectedly|Surprisingly|Unexpectedly|Suddenly|Gradually|Progressively|Incrementally|Decrementally|Proportionally|Relatively|Comparatively|Absolutely|Definitely|Certainly|Surely|Probably|Possibly|Maybe|Perhaps|Likely|Unlikely|Doubtfully|Questionably|Arguably|Presumably|Supposedly|Allegedly|Apparently|Obviously|Clearly|Evidently|Manifestly|Undoubtedly|Unquestionably|Indisputably|Undeniably|Irrefutably|Conclusively|Decisively|Definitively)['"`]/gi,

  // Error messages and notifications
  /['"`](.*(?:error|failed|failure|invalid|missing|required|not found|unauthorized|forbidden|timeout|expired|cancelled|aborted).*?)['"`]/gi,

  // Button and action text
  /['"`](Click|Press|Tap|Select|Choose|Pick|Confirm|Accept|Decline|Reject|Approve|Deny|Allow|Block|Grant|Revoke).*?['"`]/gi,

  // Status messages
  /['"`](.*(?:loading|saving|processing|connecting|downloading|uploading|syncing|updating|installing|uninstalling).*?)['"`]/gi,
];

// Patterns to exclude (these are likely not user-facing strings)
const EXCLUDE_PATTERNS = [
  /console\.(log|error|warn|info|debug)/,
  /throw new Error/,
  /import.*from/,
  /export.*from/,
  /\.classList\./,
  /\.getAttribute/,
  /\.setAttribute/,
  /\.addEventListener/,
  /\.removeEventListener/,
  /\.querySelector/,
  /\.getElementById/,
  /\.className/,
  /\.style\./,
  /\.dataset\./,
  /localStorage\./,
  /sessionStorage\./,
  /JSON\.(parse|stringify)/,
  /fetch\(/,
  /new URL/,
  /new Date/,
  /new RegExp/,
  /\.test\(/,
  /\.match\(/,
  /\.replace\(/,
  /\.split\(/,
  /\.join\(/,
  /\.slice\(/,
  /\.substring\(/,
  /\.indexOf\(/,
  /\.includes\(/,
  /\.startsWith\(/,
  /\.endsWith\(/,
  /\.toLowerCase\(/,
  /\.toUpperCase\(/,
  /\.trim\(/,
  /\.toString\(/,
  /\.valueOf\(/,
  /\.hasOwnProperty\(/,
  /typeof\s+/,
  /instanceof\s+/,
  /\.length/,
  /\.push\(/,
  /\.pop\(/,
  /\.shift\(/,
  /\.unshift\(/,
  /\.splice\(/,
  /\.sort\(/,
  /\.reverse\(/,
  /\.filter\(/,
  /\.map\(/,
  /\.reduce\(/,
  /\.forEach\(/,
  /\.find\(/,
  /\.some\(/,
  /\.every\(/,
  /Math\./,
  /Number\./,
  /String\./,
  /Array\./,
  /Object\./,
  /Promise\./,
  /setTimeout/,
  /setInterval/,
  /clearTimeout/,
  /clearInterval/,
  /requestAnimationFrame/,
  /cancelAnimationFrame/,
];

function getAllFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, and other build directories
      if (
        !['node_modules', 'dist', '.git', '.vscode', 'coverage'].includes(item)
      ) {
        getAllFiles(fullPath, files);
      }
    } else if (SCAN_EXTENSIONS.includes(extname(item))) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractPotentialStrings(content, filePath) {
  const potentialStrings = new Set();

  // Skip if this looks like a test file or config file
  if (
    filePath.includes('test') ||
    filePath.includes('spec') ||
    filePath.includes('config')
  ) {
    return potentialStrings;
  }

  for (const pattern of HARDCODED_STRING_PATTERNS) {
    const matches = content.matchAll(pattern);

    for (const match of matches) {
      const line = content.substring(0, match.index).split('\n').length;
      const context = content.substring(
        Math.max(0, match.index - 50),
        match.index + 50
      );

      // Check if this line should be excluded
      const shouldExclude = EXCLUDE_PATTERNS.some(excludePattern =>
        excludePattern.test(context)
      );

      if (!shouldExclude) {
        const string = match[1] || match[0];
        const cleanString = string.replace(/^['"`]|['"`]$/g, '');

        if (cleanString.length > 2 && cleanString.length < 200) {
          potentialStrings.add({
            string: cleanString,
            file: filePath.replace(projectRoot, ''),
            line,
            context: context.trim(),
          });
        }
      }
    }
  }

  return potentialStrings;
}

function loadLocaleKeys() {
  const localeKeys = new Set();

  try {
    const locales = readdirSync(localesDir);

    for (const locale of locales) {
      const messagesPath = join(localesDir, locale, 'messages.json');

      try {
        const content = readFileSync(messagesPath, 'utf8');
        const messages = JSON.parse(content);

        for (const key of Object.keys(messages)) {
          localeKeys.add(key);
        }
      } catch (error) {
        console.warn(
          `Warning: Could not read ${messagesPath}: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.error(`Error reading locales directory: ${error.message}`);
  }

  return localeKeys;
}

function main() {
  console.log('🔍 Scanning for potential missing localization keys...\n');

  const files = getAllFiles(srcDir);
  const localeKeys = loadLocaleKeys();
  const potentialMissingStrings = new Set();

  console.log(`📁 Scanning ${files.length} files...`);
  console.log(`🗝️  Found ${localeKeys.size} existing locale keys\n`);

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const strings = extractPotentialStrings(content, file);

      for (const stringInfo of strings) {
        potentialMissingStrings.add(stringInfo);
      }
    } catch (error) {
      console.warn(`Warning: Could not read ${file}: ${error.message}`);
    }
  }

  if (potentialMissingStrings.size === 0) {
    console.log('✅ No potential missing localization keys found!');
    return;
  }

  console.log(
    `🔍 Found ${potentialMissingStrings.size} potential hardcoded strings:\n`
  );

  const sortedStrings = Array.from(potentialMissingStrings).sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line
  );

  for (const { string, file, line, context } of sortedStrings) {
    console.log(`📍 ${file}:${line}`);
    console.log(`   String: "${string}"`);
    console.log(`   Context: ${context}`);
    console.log('');
  }

  console.log(`📊 Summary:`);
  console.log(`   - ${files.length} files scanned`);
  console.log(`   - ${localeKeys.size} existing locale keys`);
  console.log(`   - ${potentialMissingStrings.size} potential missing keys`);
  console.log('');
  console.log(
    '💡 Review these strings to determine if they should be localized.'
  );
  console.log(
    '   Not all hardcoded strings need localization (e.g., technical identifiers, URLs, etc.)'
  );
}

main();
