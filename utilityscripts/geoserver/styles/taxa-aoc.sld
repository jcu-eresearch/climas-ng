<?xml version="1.0" encoding="UTF-8" ?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Taxa concern</Name>
    <UserStyle>
      <Title>Taxa Concern</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.6</Opacity>
            <ColorMap>

              <ColorMapEntry color="#ffffff" opacity="0" quantity="0"/>
              
              <ColorMapEntry color="#eecc99" opacity="1" quantity="1"/>
              <ColorMapEntry color="#bb7700" opacity="1" quantity="9" label="liminal" />
              <ColorMapEntry color="#ff6666" opacity="1" quantity="11" label="liminal"/>
              <ColorMapEntry color="#992222" opacity="1" quantity="17"/>
              <ColorMapEntry color="#880000" opacity="1" quantity="21"/>

              </ColorMap>
            </RasterSymbolizer>
          </Rule>
      </FeatureTypeStyle>
      </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
