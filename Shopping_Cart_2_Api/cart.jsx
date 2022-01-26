// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

//Products start here

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");

  //Defne doFetch here with useDataApi for sue below
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  //console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    console.log(`add to Cart ${JSON.stringify(item)}`);
    if (item[0].instock == 0) return; //if no stock return WORKS
    setCart([...cart, ...item]);
    //doFetch(query);
    item[0].instock =  item[0].instock - 1;
  };
  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    let target = cart.filter((item, i) => index == i);
    console.log( "this is the target ", target);
    target[0].instock = target[0].instock +1; //works
    setCart(newCart);
    
  };
  const photos = ["https://picsum.photos/id/100/50/50","https://picsum.photos/id/101/50/50",
  "https://picsum.photos/id/102/50/50","https://picsum.photos/id/103/50/50"];

  let list = items.map((item, index) => {// was reloading every time button pushed, will fix later
    //let n = index + Math.floor(Math.random()*1000);
    //let url = "https://picsum.photos/id/" + n + "/50/50";
    //photos.push(url);

    return (
      <li key={index}>
        <Image src={photos[index % 4]} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name} ${item.cost} - Stock={item.instock}
        </Button>
        <br/>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });

//Cart List Starts Here

  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country}       
            <Button style = {{float:"right"}} onClick={() => deleteCartItem(index)}> Remove</Button> 
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal} this`);
    return newTotal;
  };


  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    //do fetch
    doFetch(url); //see above where we define doFetch function using React API library
    //data is name of return object and also property with objects we want
    //hence data.data
    console.log('data is here', data.data)

    //extract data from fetch
    let newItems = data.data.map((item) => {
      //console.log('this is item', item.attributes);
      let attributes = item.attributes;
      //console.log('this is attributes', attributes)
      let {name,country,cost,instock} = attributes;
      //console.log({name,country,cost,instock});
      return {name,country,cost,instock};
    });
    console.log(newItems)
    setItems([...newItems])
  };

  //added to actually do checkout correctly
  const handleCheckout = () => {
    console.log(`time to check out`)
    setCart([]);
    checkOut;
  }

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={handleCheckout}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/api/products`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
