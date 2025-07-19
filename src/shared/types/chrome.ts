// Chrome extension API types and interfaces

export interface ChromeStorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}

export interface ChromeStorageChanges {
  [key: string]: ChromeStorageChange;
}

export interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
  windowId?: number;
}

export interface ChromeNotificationOptions {
  type: 'basic' | 'image' | 'list' | 'progress';
  iconUrl: string;
  title: string;
  message: string;
  contextMessage?: string;
  priority?: number;
  eventTime?: number;
  buttons?: Array<{
    title: string;
    iconUrl?: string;
  }>;
  imageUrl?: string;
  items?: Array<{
    title: string;
    message: string;
  }>;
  progress?: number;
  isClickable?: boolean;
}

export interface ChromeContextMenuItem {
  id: string;
  title: string;
  contexts: Array<
    | 'all'
    | 'page'
    | 'frame'
    | 'selection'
    | 'link'
    | 'editable'
    | 'image'
    | 'video'
    | 'audio'
  >;
  onclick?: (info: chrome.contextMenus.OnClickData, tab: ChromeTab) => void;
}

export interface ChromeDeclarativeNetRequestRule {
  id: number;
  priority?: number;
  condition: {
    urlFilter?: string;
    regexFilter?: string;
    isUrlFilterCaseSensitive?: boolean;
    initiatorDomains?: string[];
    excludedInitiatorDomains?: string[];
    requestDomains?: string[];
    excludedRequestDomains?: string[];
    resourceTypes?: string[];
    excludedResourceTypes?: string[];
    requestMethods?: string[];
    excludedRequestMethods?: string[];
  };
  action: {
    type:
      | 'block'
      | 'redirect'
      | 'allow'
      | 'upgradeScheme'
      | 'modifyHeaders'
      | 'allowAllRequests';
    redirect?: {
      url?: string;
      extensionPath?: string;
      transform?: {
        scheme?: string;
        username?: string;
        password?: string;
        host?: string;
        port?: string;
        path?: string;
        query?: string;
        queryTransform?: {
          addOrReplaceParams?: Array<{ key: string; value: string }>;
          removeParams?: string[];
        };
        fragment?: string;
      };
    };
    requestHeaders?: Array<{
      header: string;
      operation: 'append' | 'set' | 'remove';
      value?: string;
    }>;
    responseHeaders?: Array<{
      header: string;
      operation: 'append' | 'set' | 'remove';
      value?: string;
    }>;
  };
}
