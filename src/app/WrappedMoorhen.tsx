import { addMolecule, addMap, setActiveMap } from 'moorhen'
import { MoorhenContainer, MoorhenMolecule, MoorhenMap, MoorhenReduxStore, setShowShortcutToast, setShowHoverInfo, hideMolecule, showMolecule, hideMap, showMap, MoorhenRamachandran, MoorhenLigandValidation, MoorhenCarbohydrateValidation, MoorhenDifferenceMapPeaks, MoorhenValidation, MoorhenPepflipsDifferenceMap, MoorhenQScore, MoorhenUnmodelledBlobs, MoorhenWaterValidation, MoorhenFillMissingAtoms,MoorhenJsonValidation,MoorhenMMRRCCPlot, autoOpenFiles, setOrigin } from 'moorhen'
import { useRef, useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { moorhen } from 'moorhen/types/moorhen';
import { useDispatch, useSelector } from 'react-redux';
import { UndoOutlined, RedoOutlined, CenterFocusWeakOutlined, ExpandMoreOutlined, ExpandLessOutlined, VisibilityOffOutlined, VisibilityOutlined, DownloadOutlined, Settings, InfoOutlined } from '@mui/icons-material'

export const WrappedMoorhen = () =>  {

    const dispatch = useDispatch()

    const glRef = useRef(null)
    const timeCapsuleRef = useRef(null)
    const commandCentre = useRef(null)
    const moleculesRef = useRef(null)
    const mapsRef = useRef(null)
    const activeMapRef = useRef(null)
    const lastHoveredAtom = useRef(null)
    const prevActiveMoleculeRef = useRef(null)

    const pdbCodeFetchInputRef = useRef<HTMLInputElement | null>(null);
    const molecules = useSelector((state: moorhen.State) => state.molecules.moleculeList)
    const maps = useSelector((state: moorhen.State) => state.maps)
    const visibleMolecules = useSelector((state: moorhen.State) => state.molecules.visibleMolecules)
    const visibleMaps = useSelector((state: moorhen.State) => state.mapContourSettings.visibleMaps)
    const activeMap = useSelector((state: moorhen.State) => state.generalStates.activeMap)

    const monomerLibraryPath = "https://raw.githubusercontent.com/MRC-LMB-ComputationalStructuralBiology/monomers/master/"
    const baseUrl = 'https://www.ebi.ac.uk/pdbe/entry-files'

    const backgroundColor = useSelector((state: moorhen.State) => state.sceneSettings.backgroundColor)
    const defaultBondSmoothness = useSelector((state: moorhen.State) => state.sceneSettings.defaultBondSmoothness)
    const hoveredAtom = useSelector((state: moorhen.State) => state.hoveringStates.hoveredAtom)
    const origin = useSelector((state: moorhen.State) => state.glRef.origin)

    const [originText,setOriginText] = useState<string>("")

    const [modalSize, setModalSize] = useState<{ width: number; height: number }>({width: 500,height: 500})

    const collectedProps = {
        glRef, timeCapsuleRef, commandCentre, moleculesRef, mapsRef, activeMapRef,
        lastHoveredAtom, prevActiveMoleculeRef
    }

    useEffect(() => {
        dispatch(setShowShortcutToast(false))
        dispatch(setShowHoverInfo(false))
    }, [])

    useEffect(() => {
        const newOriginText = -origin[0].toFixed(2)+" "+-origin[1].toFixed(2)+" "+-origin[2].toFixed(2)+" "
        setOriginText(newOriginText)
    }, [origin])

    const setDimensions = () => {
        return [600,600]
    }

    const fetchMolecule = async (url: string, molName: string) => {
        const newMolecule = new MoorhenMolecule(commandCentre, glRef, MoorhenReduxStore, monomerLibraryPath)
        newMolecule.setBackgroundColour(backgroundColor)
        newMolecule.defaultBondOptions.smoothness = defaultBondSmoothness
        try {
            await newMolecule.loadToCootFromURL(url, molName)
            if (newMolecule.molNo === -1) {
                throw new Error("Cannot read the fetched molecule...")
            }
            await newMolecule.fetchIfDirtyAndDraw('CBs')
            await newMolecule.addRepresentation('ligands', '/*/*/*/*')
            await newMolecule.centreOn('/*/*/*/*', true, true)
            dispatch(addMolecule(newMolecule))
        } catch (err) {
            console.warn(err)
            console.warn(`Cannot fetch PDB entry from ${url}, doing nothing...`)
        }
    }

    const fetchMap = async (url: string, mapName: string, isDiffMap: boolean = false) => {
        const newMap = new MoorhenMap(commandCentre, glRef, MoorhenReduxStore)
        try {
            await newMap.loadToCootFromMapURL(url, mapName, isDiffMap)
            if (newMap.molNo === -1) throw new Error("Cannot read the fetched map...")
            dispatch(addMap(newMap))
            dispatch(setActiveMap(newMap))
        } catch (err) {
            console.warn(err)
            console.warn(`Cannot fetch map from ${url}`)
        }
        return newMap
    }

    const loadData = async (pdbCode: string) => {
        await fetchMolecule(`${baseUrl}/download/${pdbCode}.cif`, pdbCode)
        await fetchMap(`${baseUrl}/${pdbCode}_diff.ccp4`, `${pdbCode}-FoFc`, true)
        await fetchMap(`${baseUrl}/${pdbCode}.ccp4`, `${pdbCode}-2FoFc`)
    }

    const buttonClicked = () => {
        if(pdbCodeFetchInputRef.current){
           if(pdbCodeFetchInputRef.current.value.length>0){
               loadData(pdbCodeFetchInputRef.current.value)
           }
        }
    }

    return <Container fluid className="p-0">
             <Row>
                 <Col>
                     <MoorhenContainer viewOnly={false} sx={{width: '600px', maxWidth: '600px' }} setMoorhenDimensions={setDimensions} {...collectedProps}/>
                 </Col>
                 <Col>
                     <Row className="p-3">
                         <Form className="mb-3">
                           <Form.Group controlId="exampleForm.ControlInput1">
                             <Form.Label>PDB Code</Form.Label>
                             <Form.Control className="w-75" type="text" placeholder="5A3H"  ref={pdbCodeFetchInputRef}
                                 onKeyDown={(e) => {
                                     console.log(e.code)
                                     if (e.code === 'Enter') {
                                         buttonClicked()
                                         e.preventDefault()
                                     }
                             }}/>
                           </Form.Group>
                         </Form>
                         <Button className="w-50" variant="primary" type="submit" onClick={buttonClicked}>
                             Load
                         </Button>
                         <Form className="mb-3">
                             <Form.Group className='moorhen-form-group' controlId="next-upload-session-form">
                                 <Form.Label>Open files..</Form.Label>
                                 <Form.Control type="file" multiple={true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { autoOpenFiles(e.target.files, commandCentre, glRef, MoorhenReduxStore, monomerLibraryPath, backgroundColor, defaultBondSmoothness, timeCapsuleRef, dispatch) }}/>
                             </Form.Group>
                         </Form>
                     </Row>
                     <Row className="p-1">
                         <h6>Models</h6>
                         <Table>
                             <tbody>
                             {molecules.map((mol,i) => {
                                 const isVisible = (visibleMolecules.indexOf(mol.molNo)>-1)
                                 const handleCentering = () => {
                                     mol.centreOn()
                                 }
                                 const handleVisibility = (() => {
                                     if(isVisible){
                                         dispatch(hideMolecule({molNo:mol.molNo}))
                                     } else {
                                         dispatch(showMolecule({molNo:mol.molNo,show:true}))
                                     }
                                 })
                                 return <tr key={i}>
                                     <td>{mol.name}</td>
                                     <td>
                                     <Button key={1} size="sm" variant="outlined" onClick={handleVisibility}>
                                     {isVisible ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                     </Button>
                                     <Button key={2} size="sm" variant="outlined" onClick={handleCentering}>
                                     <CenterFocusWeakOutlined />
                                     </Button>
                                     </td>
                                     </tr>
                             })}
                             </tbody>
                         </Table>
                         <h6>Maps</h6>
                         <Table>
                             <thead>
                                 <tr>
                                     <th></th>
                                     <th></th>
                                     <th>Active</th>
                                 </tr>
                             </thead>
                             <tbody>
                             {maps.map((map,i) => {
                                 const isVisible = (visibleMaps.indexOf(map.molNo)>-1)
                                 const isActive = activeMap.molNo === map.molNo
                                 const handleActive = (() => {
                                     dispatch(setActiveMap(map))
                                 })
                                 const handleVisibility = (() => {
                                     if(isVisible){
                                         dispatch(hideMap({molNo:map.molNo}))
                                     } else {
                                         dispatch(showMap({molNo:map.molNo,show:true}))
                                     }
                                 })
                                 return <tr key={i}>
                                     <td>{map.name}</td>
                                     <td>
                                     <Button key={1} size="sm" variant="outlined" onClick={handleVisibility}>
                                     {isVisible ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                     </Button>
                                     </td>
                                     { isActive &&
                                     <td>
                                         <Form.Check
                                           type={"radio"}
                                           name="mapactivegroup"
                                           checked
                                         />
                                     </td>
                                     }
                                     { !isActive &&
                                     <td>
                                         <Form.Check
                                           type={"radio"}
                                           name="mapactivegroup"
                                           onClick={handleActive}
                                         />
                                     </td>
                                     }
                                     </tr>
                             })}
                             </tbody>
                         </Table>
                     </Row>
                     <Row>
                     Origin: {originText}
                     </Row>
                     <Row>
                     {(hoveredAtom && hoveredAtom.cid && hoveredAtom.molecule) &&
                     <>{hoveredAtom.molecule.name+" "+hoveredAtom.cid}</>
                     }
                     </Row>
                     <Row>
                     <MoorhenRamachandran size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     </Row>
                 </Col>
             </Row>
           </Container>

}
/*
//Not all of these work completely.
                     <MoorhenValidation height={"500px"} minHeight={"500px"} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenRamachandran size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenPepflipsDifferenceMap size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenLigandValidation size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenCarbohydrateValidation size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenDifferenceMapPeaks resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenFillMissingAtoms size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenUnmodelledBlobs size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenMMRRCCPlot size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenQScore size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     <MoorhenJsonValidation size={modalSize} resizeTrigger={false} urlPrefix={"/baby-gru"} commandCentre={commandCentre} />
                     */
