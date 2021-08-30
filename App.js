import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, StyleSheet, Button, VirtualizedList } from 'react-native';
import { DataTable, Searchbar, ToggleButton, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DefaultTheme, Provider as PaperProvider } from 'react-native-paper';



const theme = {
  ...DefaultTheme,
  roundness: 16,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#E2E2E2',
  },
  dark: true,
};


const styles = StyleSheet.create({

  app: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'start',
    margin: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
    margin: 16,
  },

  searchBar: {
    margin: 8,
    height: 32,
  },

  buttonFavoriteContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'start',
    justifyContent: 'start',
    margin: 16,
    width: '100%',
    flexDirection: "row"
  },

});

const dataNasaUrl = 'https://data.nasa.gov/resource/y77d-th95.json';


let buttonFavoriteSelected = '#388415';
let buttonFavoriteUnselected = '#8DBD77';
export default function App() {

  const [isLoading, setLoading] = useState(true);

  const [nasaData, setData] = useState([]);

  const [homeItems, setHomeItems] = useState([]);
  const [searchItems, setSearchItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);

  const [currentPage, setCurrentPage] = React.useState(0);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const [currentView, setCurrentView] = React.useState('home');

  const [searchQuery, setSearchQuery] = useState('');

  const getNasaData = async () => {
    try {
      const response = await fetch(dataNasaUrl);
      const json = await response.json();
      // console.log(json);
      setData(json);
      setHomeItems(json.slice(0, 10));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const putFavorites = async (newFavList) => {
    try {
      await AsyncStorage.setItem('@favorites', JSON.stringify(newFavList));
    } catch (e) {
      // saving error
    }
  }

  const getFavorites = async () => {
    try {
      const favoriteItemsData = await AsyncStorage.getItem('@favorites');
      if (favoriteItemsData != null) {
        const data = JSON.parse(favoriteItemsData);
        setFavoriteItems(data);
      }
    } catch (e) {
      // error reading value
    }
  }  

  useEffect(() => {
    setCurrentPage(0);
  }, [itemsPerPage]);


  useEffect(() => {
    getFavorites();
  }, [nasaData]);
  
  useEffect(() => {
    getNasaData();
  }, []);
  



  const ItemRow = (itemData) => (
    <DataTable.Row key={itemData['id']}>
      {console.log('favoriteItems.length::' + favoriteItems.length)}
      <DataTable.Cell>
        <Button
        title="*"
        onPress={() => onButtonAddFavorite(itemData)}
        color={favoriteItems.includes(itemData) ? buttonFavoriteSelected : buttonFavoriteUnselected}
      /></DataTable.Cell>
      <DataTable.Cell>{itemData['name']}</DataTable.Cell>
      <DataTable.Cell>{itemData['id']}</DataTable.Cell>
      <DataTable.Cell>{itemData['nametype']}</DataTable.Cell>
      <DataTable.Cell>{itemData['recclass']}</DataTable.Cell>
      <DataTable.Cell>{itemData['mass']}</DataTable.Cell>
      <DataTable.Cell>{itemData['fall']}</DataTable.Cell>
      <DataTable.Cell>{itemData['year']}</DataTable.Cell>
      <DataTable.Cell>{itemData['reclat']}</DataTable.Cell>
      <DataTable.Cell>{itemData['reclong']}</DataTable.Cell>
      {/* <DataTable.Cell>{'reclat' in itemData ? itemData['reclat'] : ''},{'reclong' in itemData? itemData['reclong'].reclong : ''}</DataTable.Cell> */}
      {'geolocation' in itemData ? <DataTable.Cell>{itemData['geolocation']['coordinates'][1]}°, {itemData['geolocation']['coordinates'][0]}°</DataTable.Cell> : <DataTable.Cell />}
      {/* <DataTable.Cell>{itemData['geolocation']['coordinates'][1]}°, {itemData['geolocation']['coordinates'][0]}°</DataTable.Cell> */}
    </DataTable.Row>
  );

  const getItem = (data, index) => ({
    id: Math.random().toString(12).substring(0),
    title: `Item ${index + 1}`
  });

  const onChangeSearch = (query) => {
    console.log(query.length);
    if (query.length == 0) {
      setSearchItems([]);
      setSearchQuery(query);
      setCurrentView('home');
      return;
    }
    let _queryItems = nasaData.filter((obj, index, arr) => {
        let _searchDataSet = obj['name'].toLowerCase() + obj['id'];
        if (_searchDataSet.includes(query)) {
          return obj;
        }
      });
    setSearchQuery(query);
    setSearchItems(_queryItems);
    setCurrentView('search');
  };

  const onButtonToggle = (value) => {
    setCurrentView(currentView === 'favorites' ? 'home' : 'favorites');
    console.log(currentView);
  };

  const onCurrentPageChange = (newPage) => {
    const from = newPage * itemsPerPage;
    const to = Math.min((newPage + 1) * itemsPerPage, nasaData.length);
    // console.log('Page :: ' + page);
    // console.log('From :: ' + from);
    // console.log('To :: ' + to);
    // console.log(nasaData.slice(from, to));
    // console.log(nasaData.slice(from, to));
    setHomeItems(nasaData.slice(from, to));
    setCurrentPage(newPage);
  };


  const onButtonAddFavorite = (itemData) => {
    if (!favoriteItems.includes(itemData)) {
      let _favs = [...favoriteItems, itemData];
      setFavoriteItems(_favs);
      putFavorites(_favs);
    } else {
      let _favs = favoriteItems.filter((obj, index, arr) => {
        if (obj.id != itemData.id) {
          return obj;          
        }
      });
      setFavoriteItems(_favs);
      putFavorites(_favs);
    }
  };

  return (
    <PaperProvider theme={theme}>
    <View>
      <Appbar style={{backgroundColor:'#E2E2E2'}}>
      <Appbar.Content title="FlogistixChallenge" style={{color: '#fff'}} />
        <Searchbar
        style ={styles.searchBar}
          placeholder="Search"
          onChangeText={onChangeSearch}
          value={searchQuery}
        />
        <ToggleButton
          icon="star"
          value="favorites"
          status={currentView === 'favorites'}
          onPress={onButtonToggle}
          color={currentView === 'favorites' ? buttonFavoriteSelected: buttonFavoriteUnselected}
        />
      </Appbar>

      {isLoading ? <ActivityIndicator /> : (
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>*</DataTable.Title>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Id</DataTable.Title>
            <DataTable.Title>nametype</DataTable.Title>
            <DataTable.Title>recclass</DataTable.Title>
            <DataTable.Title>mass (g)</DataTable.Title>
            <DataTable.Title>fall</DataTable.Title>
            <DataTable.Title>year</DataTable.Title>
            <DataTable.Title>reclat</DataTable.Title>
            <DataTable.Title>reclong</DataTable.Title>
            <DataTable.Title>GeoLocation</DataTable.Title>
          </DataTable.Header>


          {/* Home View */}
          {currentView === 'home' && homeItems.map(function (itemData, index) {
            // console.log(itemData['id']);
            return ItemRow(itemData);
          })}
          {currentView === 'home' && <DataTable.Pagination
            page={currentPage}
            numberOfPages={nasaData.length / 10}
            onPageChange={onCurrentPageChange}
            label={"Page: " + currentPage + " of " + nasaData.length / itemsPerPage}
            // optionsPerPage={optionsPerPage}
            itemsPerPage={itemsPerPage}
            // setItemsPerPage={setItemsPerPage}
            showFastPagination
            optionsLabel={'Rows per page'}
          />}
          {/* Search View */}
          {searchQuery.length > 1 && searchItems.map((itemData, index) => ItemRow(itemData))}
          {/* Favorites View */}
          {currentView === 'favorites' && favoriteItems.map(function (itemData, index) {
            return ItemRow(itemData);
          })}
        </DataTable>

      )
      }

    </View >
    </PaperProvider>

  );
};

