import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

//mock global do supabase e asyncstorage 
jest.mock('../../src/infra/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

// Mock global para React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const React = require('react');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useFocusEffect: (callback: any) => {
      React.useEffect(callback, []);
    },
    useRoute: jest.fn().mockReturnValue({ params: {} }),
  };
});

// Mock global para Expo Vector Icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: any) => React.createElement(Text, null, `Icon: ${props.name}`),
    Feather: (props: any) => React.createElement(Text, null, `Feather: ${props.name}`),
    MaterialIcons: (props: any) => React.createElement(Text, null, `Material: ${props.name}`),
  };
});
