import HeaderPages from "../../components/headerPages";
import Table from "../../components/table";
import TableContainer from "../../components/tableContainer";
import * as S from "./styles"
import IFilter from "../../images/iconsPagesLoged/ifilter.png"
import { useEffect, useState } from "react";
import InputSearch from "../../components/InputSearch";
import { color } from "../../theme/constants";
import * as Req from "../../services/products/ListProductsGet";
import * as T from "../../types/DashTypes"
import Pagination from "../../components/pagination";
import FilterProducts from "../../components/filterProducts";
import CheckboxInput from "../../components/checkboxInput";
import { Search } from "../../services/products/SearchGet"
import ButtonDefault from "../../components/buttonDefault";
import Loading from "../../images/gif/loading.gif"

export default function Products() {
    const [listAllProducts, setListAllProducts] = useState<Array<T.PageProductsType>>([])
    const [checkbox, setCheckbox] = useState(false);
    const [searchFor, setSearchFor] = useState("")
    const [pageCurrent, setPageCurrent] = useState(0)
    const [quantityItemsTotal, setQuantityItemsTotal] = useState(0)
    const [quantityItemsActual, setQuantityActual] = useState(10)
    const [isLoading] = useState(false)
    const [stateFilter, setStateFilter] = useState('')

   
    const quantitiesButtons = 4
    //const quantButtonsRight = 3
    // const totalPages = Math.ceil(1822 / 10)


    const showFilter = () => {
        setCheckbox(prev => !prev)
    }

    useEffect(() => {
        const productList = async () => {
            const listCompleteProducts = await Req.ListAllProducts(pageCurrent, stateFilter)
            setListAllProducts(listCompleteProducts.content)
            const lengthList = listCompleteProducts.totalElements
            setQuantityItemsTotal(lengthList)
            if((pageCurrent+1) * 10 < quantityItemsTotal){
                setQuantityActual((pageCurrent+1) * 10)
            } else {
                setQuantityActual(quantityItemsTotal)
            }
        }
        productList()
    }, [pageCurrent, stateFilter, searchFor, quantityItemsTotal])

    function formatText(status: string) {
        if (status === "NEUTRO") {
            return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        }
        if (status === "EM_ALTA" || status === "EM_BAIXA") {
            const statusSplit = status.split('_')
            const statusFormat = `${statusSplit[0]} ${statusSplit[1]}`
            return statusFormat.charAt(0).toUpperCase() + statusFormat.slice(1).toLowerCase();
        }
    }
    const toSearch = async () => {
        const resultSearch = await Search(searchFor)
        setListAllProducts(resultSearch)
    }
    async function changePage(page: number){
        const listCompleteProducts = await Req.ListAllProducts(page, stateFilter )
        setPageCurrent(page)
        setListAllProducts(listCompleteProducts.content)
    }
    function goBack(){
        setPageCurrent(pageCurrent-1)      
    }
    function advance(){
        setPageCurrent(pageCurrent+1)
    }
    function handleOptionSelected(event: React.ChangeEvent<HTMLInputElement>){
        setStateFilter(event.target.value)
        setCheckbox(false)
    }

    return (
        <>
            <HeaderPages
                title="Produtos"
                colorTitle="#212121"
                bgColor="transparent"
            >
            </HeaderPages>
            <S.ContainerInformations>
                <TableContainer
                    iconTable={IFilter}
                    onClickImg={showFilter}
                    backgroundColor="#F5F5F5"
                    descriptionImage="Ícone para filtro"
                    inputFilter={<InputSearch
                        onClick={toSearch}
                        onChange={(event) => setSearchFor(event.target.value)}
                    />}
                >
                    {checkbox && (
                        <FilterProducts
                            button={<ButtonDefault 
                                    textButton={!isLoading ? "Aplicar" : ""}
                                    disabled={isLoading}
                                    backgroundColor={!isLoading ? `${color.primary}` : "transparent"}
                                    />}
                        >  
                            <CheckboxInput
                                textLabel='Todos'
                                typeInput='radio'
                                value=""
                                
                                onChange={handleOptionSelected}
                            />
                            <CheckboxInput
                                textLabel='Em alta'
                                fontWeightLabel='400'
                                typeInput='radio'
                                value="EM_ALTA"
                                onChange={handleOptionSelected}
                            />
                            <CheckboxInput
                                textLabel='Em baixa'
                                fontWeightLabel='400'
                                typeInput='radio'
                                value="EM_BAIXA"
                                onChange={handleOptionSelected}
                            />
                            {isLoading && <img src={Loading} alt="Carregando" />}
                        </FilterProducts>
                    )}
                    <Table
                        header={["ID", "Produtos", "Status", "Percentual"]}
                    >
                        {listAllProducts.map((item) => (
                            
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>
                                    <S.UnderlinedLink to={`/dashboard/produto/${item.id}`}>
                                        {item.nome}
                                    </S.UnderlinedLink>
                                </td>
                                <td>
                                    <S.SpanTd
                                    backgroundColor={item.percentual > 0 ? '#D9FEE6' : '#FFE1E1'}
                                    color={item.percentual > 0 ? color.success : color.failure}>{formatText(item.classificacao)}
                                    </S.SpanTd>
                                </td>
                                <td>{item.percentual}%</td>
                            </tr>
                            
                        ))}
                    </Table>
                    <Pagination
                        lengthList={quantityItemsTotal}
                        quantityInPage={quantityItemsActual}
                        backPage={goBack}
                        disabledToBack={pageCurrent === 0}
                        nextPage={advance}
                    >
                        <S.UlPagination>
                            {Array.from({ length: Math.min(quantitiesButtons) })
                                .map((_, index) => index + pageCurrent)
                                .map((page) => (
                                    <S.UlPagination key={page}>
                                        <S.PageActul
                                            isActive={page === pageCurrent}
                                            onClick={() => changePage(page)}
                                        >
                                            {/* API starts paging at 0, so it is necessary to add 1 to the number that will be rendered */}
                                            {page + 1}
                                        </S.PageActul>
                                    </S.UlPagination>
                                ))}
                        </S.UlPagination>
                    </Pagination>
                </TableContainer>
            </S.ContainerInformations>
        </>
    )
}