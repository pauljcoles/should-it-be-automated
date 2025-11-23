/**
 * Scale label utilities for making 1-5 scores more understandable
 */

export function getImpactLabel(value: number): string {
  switch (value) {
    case 1: return 'Minor issue';
    case 2: return 'Some impact';
    case 3: return 'Significant problem';
    case 4: return 'Major problem';
    case 5: return 'Critical/severe';
    default: return 'Significant problem';
  }
}

export function getProbabilityLabel(value: number): string {
  switch (value) {
    case 1: return 'Rarely used';
    case 2: return 'Occasionally used';
    case 3: return 'Moderately used';
    case 4: return 'Frequently used';
    case 5: return 'Core feature';
    default: return 'Moderately used';
  }
}

export function getDistinctnessLabel(value: number): string {
  switch (value) {
    case 1: return 'Duplicates existing tests';
    case 2: return 'Similar to existing';
    case 3: return 'Some new info';
    case 4: return 'Mostly new info';
    case 5: return 'Completely new';
    default: return 'Some new info';
  }
}

export function getFixProbabilityLabel(value: number): string {
  switch (value) {
    case 1: return 'Low priority to fix';
    case 2: return 'Would fix later';
    case 3: return 'Would fix eventually';
    case 4: return 'Fix soon';
    case 5: return 'Fix immediately';
    default: return 'Would fix eventually';
  }
}

export function getEaseLabel(value: number): string {
  switch (value) {
    case 1: return 'Very difficult';
    case 2: return 'Difficult';
    case 3: return 'Moderate complexity';
    case 4: return 'Easy';
    case 5: return 'Very easy';
    default: return 'Moderate complexity';
  }
}

export function getSpeedLabel(value: number): string {
  switch (value) {
    case 1: return 'Takes days';
    case 2: return 'Takes a day';
    case 3: return 'Takes hours';
    case 4: return 'Takes an hour';
    case 5: return 'Takes minutes';
    default: return 'Takes hours';
  }
}

export function getSimilarityLabel(value: number): string {
  switch (value) {
    case 1: return 'No similar areas broke';
    case 2: return 'Rarely similar issues';
    case 3: return 'Some similar issues';
    case 4: return 'Often similar issues';
    case 5: return 'Similar areas break often';
    default: return 'No similar areas broke';
  }
}

export function getBreakFrequencyLabel(value: number): string {
  switch (value) {
    case 1: return 'Never/rarely breaks';
    case 2: return 'Rarely breaks';
    case 3: return 'Occasionally breaks';
    case 4: return 'Frequently breaks';
    case 5: return 'Breaks frequently';
    default: return 'Never/rarely breaks';
  }
}
